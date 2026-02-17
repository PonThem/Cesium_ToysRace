/**
 * Centralized error logging - always uses console.error for unexpected failures
 */

export function logComponentError(component, context, err) {
  const message = err?.message ?? String(err)
  const stack = err?.stack
  console.error(
    `[ERROR] ${component}: ${context}`,
    '\n  Message:', message,
    stack ? `\n  Stack:\n${stack}` : ''
  )
  return message
}

export function logUnexpectedError(context, err) {
  const message = err?.message ?? String(err)
  const stack = err?.stack
  console.error(
    `[ERROR] Unexpected: ${context}`,
    '\n  Message:', message,
    stack ? `\n  Stack:\n${stack}` : ''
  )
  return message
}
