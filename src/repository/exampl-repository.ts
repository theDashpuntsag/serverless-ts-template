import logger from '@libs/winston';

const TABLE_NAME = '';

const getItemById = async (): Promise<object | undefined> => {
  try {
    return {};
  } catch (error: unknown) {
    logger.error('Error occurred on getItemById ');
  }
};

export { getItemById };
