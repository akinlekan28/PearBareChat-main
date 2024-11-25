export function createMessage (msg, local = false) {
  return {
    timestamp: new Date().toISOString(), // Store as ISO string instead of Date object
    message: msg,
    local,
    type: 'text',
  }
}
