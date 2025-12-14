#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "($(date +'%Y-%m-%d %H:%M:%S')) ~ $1"
}

# 1. Verify system has git and pnpm
log "${WHITE}-----------------------------------------------------------------------------------------------------${NC}"
log "${WHITE}Checking system requirements...${NC}"
if ! command -v git &> /dev/null; then
    log "${RED}Error: git is not installed.${NC}"
    exit 1
fi
if ! command -v pnpm &> /dev/null; then
    log "${RED}Error: pnpm is not installed.${NC}"
    exit 1
fi
log "${GREEN}System requirements met.${NC}"

# 1.1 Check if git working directory is clean
log "${YELLOW}Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    log "${RED}Error: Git working directory is not clean.${NC}"
    log "${RED}Please commit or stash your changes before deploying.${NC}"
    exit 1
fi
log "${GREEN}Git working directory is clean.${NC}"


# 2. Build the project before deployment
log "${YELLOW}Building project before deployment...${NC}"
if ! pnpm run build; then
    log "${RED}Error: Failed to build project.${NC}"
    exit 1
fi
log "${GREEN}Project built successfully.${NC}"


# 3. Lint the project before deployment
log "${YELLOW}Linting project before deployment...${NC}"
if ! pnpm run lint; then
    log "${RED}Error: Failed to lint project.${NC}"
    exit 1
fi
log "${GREEN}Project linted successfully.${NC}"

# 3.1 Test the project before deployment
# echo -e "${YELLOW}Testing project before deployment...${NC}"
# if ! pnpm run test; then
#     echo -e "${RED}Error: Failed to test project.${NC}"
#     exit 1
# fi
# echo -e "${GREEN}Project tested successfully.${NC}"


# 5. Run through /src/repository directory and read all the table names
log "${YELLOW}Scanning for table names...${NC}"
TABLE_NAMES=$(grep -r "const TABLE_NAME =" src/repository | cut -d "'" -f 2)

if [ -z "$TABLE_NAMES" ]; then
    log "${YELLOW}No table names found in src/repository.${NC}"
else
    log "${WHITE}Found the following tables:${NC}"
    while IFS= read -r table; do
        log "${WHITE}  • ${CYAN}$table${NC}"
    done <<< "$TABLE_NAMES"

    # Check if there is a name "test" in the table name
    if echo "$TABLE_NAMES" | grep -q "test"; then
        log ""
        log "${RED}⚠️  WARNING: Found 'test' in one or more table names!${NC}"
        read -p "Do you want to proceed? (y/N) " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "${RED}Deployment aborted.${NC}"
            exit 1
        fi
    fi
fi

# 6. Finally ask user to verify all table names
log "${YELLOW}Please verify the table names listed above.${NC}"
read -p "Are these correct? (y/N) " response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log "${RED}Deployment aborted.${NC}"
    exit 1
fi
log "${GREEN}Table names verified.${NC}"

# 7. Check if the .env file exists and handle STAGE
log "${YELLOW}Checking for .env file and STAGE configuration...${NC}"
if [ -f .env ]; then
    log "${GREEN}.env file found.${NC}"

    # 8. Verify deployment
    log "${YELLOW}Deployment Verification${NC}"
    CURRENT_STAGE=$(grep "^STAGE=" .env | cut -d '=' -f2)
    log "Deploying to stage: ${GREEN}$CURRENT_STAGE${NC}"
    read -p "Do you want to proceed? (y/N) " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "${RED}Deployment aborted.${NC}"
        exit 1
    fi
else
    log "${YELLOW}No .env file found, skipping .env verification.${NC}"
fi



# 9. Set the STAGE variable for serverless deployment
log "${YELLOW}Which stage should this stack be deployed to?${NC}"
log "1. dev"
log "2. prod"
read -p "Enter your choice (1 or 2): " STAGE_CHOICE

case $STAGE_CHOICE in
  1)
    STAGE="dev"
    ;;
  2)
    STAGE="prod"
    ;;
  *)
    log "${RED}Error: Invalid choice. Please select 1 or 2.${NC}"
    exit 1
    ;;
esac

log "${GREEN}Deploying to stage: $STAGE${NC}"

# Execute deployment
npx serverless deploy --stage "$STAGE"
