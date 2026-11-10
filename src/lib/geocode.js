// Nominatim: em desenvolvimento usa o proxy /geocode do Vite (evita CORS);
// em producao (Vercel) chama o Nominatim direto do navegador.
const BASE_GEOCODE = import.meta.env.DEV
  ? "/geocode"
  : "https://nominatim.openstreetmap.org";

export async function buscarEnderecos(consulta) {
  const texto = consulta.trim();

  if (!texto) {
    return [];
  }

  try {
    const url =
      BASE_GEOCODE + "/search" +
      `?format=json&addressdetails=1&limit=5&accept-language=pt-BR` +
      `&q=${encodeURIComponent(texto)}`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    return dados.map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      rotulo: item.display_name,
    }));
  } catch {
    return [];
  }
}

export async function enderecoPorCoordenadas(lat, lng) {
  try {
    const url =
      BASE_GEOCODE + "/reverse" +
      `?format=json&zoom=16&accept-language=pt-BR&lat=${lat}&lon=${lng}`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    return dados.display_name || null;
  } catch {
    return null;
  }
}
