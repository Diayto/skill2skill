export async function registerUser(data){
  // тут позже подключим реальный бэкенд (Supabase/Firestore/Express)
  return { ok: true, id: crypto.randomUUID(), ...data };
}
