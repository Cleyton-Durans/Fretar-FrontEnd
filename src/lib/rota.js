export async function calcularRota(pontoOrigem, pontoDestino) {
  const [origemLat, origemLng] = pontoOrigem;
  const [destLat, destLng] = pontoDestino;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origemLng},${origemLat};${destLng},${destLat}` +
    `?overview=full&geometries=geojson`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!dados.routes || dados.routes.length === 0) {
    throw new Error("Nenhuma rota encontrada entre esses pontos.");
  }

  const rota = dados.routes[0];

  return {
    pontos: rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanciaKm: Number((rota.distance / 1000).toFixed(1)),
    duracaoMin: Math.round(rota.duration / 60),
  };
}