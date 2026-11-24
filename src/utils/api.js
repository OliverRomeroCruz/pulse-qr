/**
 * Helper to safely parse API responses as JSON.
 * Prevents "Unexpected token '<', <!DOCTYPE... is not valid JSON" crashes
 * when a non-JSON or HTML response is returned by a proxy or server error.
 */
export async function parseJsonResponse(res) {
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!res.ok) {
      const error = new Error(`Error del servidor (${res.status}). Por favor, inténtalo de nuevo.`);
      error.status = res.status;
      throw error;
    }
    const error = new Error('Respuesta inesperada del servidor (formato no válido).');
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const errorMsg = data?.error || `Error del servidor (${res.status}).`;
    const error = new Error(errorMsg);
    if (data && typeof data === 'object') {
      Object.assign(error, data);
    }
    error.status = res.status;
    throw error;
  }

  return data;
}
