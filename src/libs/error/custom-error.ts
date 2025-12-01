class CustomError extends Error {
  statusCode: number;
  key: string | null = null;

  constructor(message: string, statusCode: number = 500, key: string | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.key = key;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
