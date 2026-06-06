 export function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
   

 export function generateBookingReference(): string {
  const prefix = "BKG";
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}
