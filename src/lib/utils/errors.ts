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

export class FlowItemNotFoundError extends AppError {
  constructor(id: string) {
    super(1004, `FlowItem not found: ${id}`);
  }
}

export class FlowItemNameExistsError extends AppError {
  constructor(application: string, name: string) {
    super(1005, `FlowItem name already exists in application ${application}: ${name}`);
  }
}

export class FlowItemCancelNotAllowedError extends AppError {
  constructor(id: string, status: number) {
    super(1006, `FlowItem cannot be canceled in current status: ${status}`);
  }
}

export class FlowItemAlreadyFinishedError extends AppError {
  constructor(id: string) {
    super(1007, `FlowItem already finished: ${id}`);
  }
}
