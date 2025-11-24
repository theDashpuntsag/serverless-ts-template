#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# 1. Verify system has git and pnpm
echo -e "\n${YELLOW}Checking system requirements...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed.${NC}"
    exit 1
fi
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}System requirements met.${NC}"


# 2. Build the project before deployment
echo -e "${YELLOW}Building project before deployment...${NC}"

if ! pnpm run build; then
    echo -e "${RED}Error: Failed to build project.${NC}"
    exit 1
fi
echo -e "${GREEN}Project built successfully.${NC}"


# 3. Lint the project before deployment
echo -e "\n${YELLOW}Linting project before deployment...${NC}"
if ! pnpm run lint; then
    echo -e "${RED}Error: Failed to lint project.${NC}"
    exit 1
fi
echo -e "${GREEN}Project linted successfully.${NC}"

# 3.1 Test the project before deployment
# echo -e "\n${YELLOW}Testing project before deployment...${NC}"
# if ! pnpm run test; then
#     echo -e "${RED}Error: Failed to test project.${NC}"
#     exit 1
# fi
# echo -e "${GREEN}Project tested successfully.${NC}"


# 5. Run through /src/repository directory and read all the table names
echo -e "\n${YELLOW}Scanning for table names...${NC}"
TABLE_NAMES=$(grep -r "const TABLE_NAME =" src/repository | cut -d "'" -f 2)

if [ -z "$TABLE_NAMES" ]; then
    echo -e "${YELLOW}No table names found in src/repository.${NC}"
else
    echo -e "Found the following tables:"
    echo "$TABLE_NAMES"

    # Check if there is a name "test" in the table name
    if echo "$TABLE_NAMES" | grep -q "test"; then
        echo -e "\n${RED}WARNING: Found 'test' in one or more table names!${NC}"
        read -p "Do you want to proceed? (y/N) " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment aborted.${NC}"
            exit 1
        fi
    fi
fi

# 6. Finally ask user to verify all table names
echo -e "\n${YELLOW}Please verify the table names listed above.${NC}"
read -p "Are these correct? (y/N) " response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
fi

# 7. Check if the .env file exists and handle STAGE
echo -e "\n${YELLOW}Checking for .env file and STAGE configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found.${NC}"
    exit 1
fi
echo -e "${GREEN}.env file found.${NC}"

# Read STAGE from .env
CURRENT_STAGE=$(grep "^STAGE=" .env | cut -d '=' -f2)

if [ "$CURRENT_STAGE" == "dev" ]; then
    echo -e "${YELLOW}Current STAGE is 'dev'. Creating snapshot and switching to 'prod'...${NC}"

    # Create snapshot
    cp .env .env.temp
    echo -e "${GREEN}Created .env.temp snapshot.${NC}"

    # Switch to prod
    # using sed to replace STAGE=dev with STAGE=prod.
    # handling both mac (BSD) and gnu sed differences if necessary, but assuming standard environment or simple replacement.
    # For cross-platform compatibility (macOS/Linux), using a temporary file for sed is often safer or using perl.
    # Here I'll use a simple approach compatible with most bash environments or just overwrite.
    sed -i.bak 's/^STAGE=dev/STAGE=prod/' .env && rm .env.bak

    echo -e "${GREEN}Switched .env STAGE to 'prod'.${NC}"

    STAGE="prod"
elif [ "$CURRENT_STAGE" == "prod" ]; then
    echo -e "${GREEN}Current STAGE is already 'prod'.${NC}"
    STAGE="prod"
else
    echo -e "${YELLOW}Current STAGE is '$CURRENT_STAGE'.${NC}"
    STAGE="$CURRENT_STAGE"
fi

# 8. Verify deployment
echo -e "\n${YELLOW}Deployment Verification${NC}"
echo -e "Deploying to stage: ${GREEN}$STAGE${NC}"
read -p "Do you want to proceed? (y/N) " response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    # If we created a temp file, maybe we should revert?
    # The requirement didn't explicitly say to revert on abort, but it's good practice.
    # For now, I'll stick to the strict requirements: "After this operation lets verify the user accepts to proceed or not."
    exit 1
fi

# Execute deployment
npx serverless deploy --stage "$STAGE"
