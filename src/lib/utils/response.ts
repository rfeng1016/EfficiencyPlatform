import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function successResponse<T>(data: T, message = 'Success') {
  return NextResponse.json({ code: 200, message, data });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { code: 400, message: 'Validation error', data: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { code: error.code, message: error.message, data: error.details },
      { status: 400 }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { code: 500, message: 'Internal server error' },
    { status: 500 }
  );
}
