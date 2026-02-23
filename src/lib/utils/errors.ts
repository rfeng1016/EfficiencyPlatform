export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class PipelineNotFoundError extends AppError {
  constructor(id: string) {
    super(1001, `Pipeline not found: ${id}`);
  }
}

export class PipelineNameExistsError extends AppError {
  constructor(name: string) {
    super(1002, `Pipeline name already exists: ${name}`);
  }
}

export class DefaultPipelineExistsError extends AppError {
  constructor() {
    super(1003, 'A default pipeline already exists');
  }
}
