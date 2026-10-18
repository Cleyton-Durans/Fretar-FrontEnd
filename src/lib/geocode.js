// Acesso ao Nominatim via proxy /geocode do Vite (evita CORS).

export async function buscarEnderecos(consulta) {
  const texto = consulta.trim();

  if (!texto) {
    return [];
  }

  try {
    const url =
      "/geocode/search" +
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
      "/geocode/reverse" +
      `?format=json&zoom=16&accept-language=pt-BR&lat=${lat}&lon=${lng}`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    return dados.display_name || null;
  } catch {
    return null;
  }
}
