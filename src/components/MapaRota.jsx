import { useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import marcadorIcone from "leaflet/dist/images/marker-icon.png";
import marcadorIcone2x from "leaflet/dist/images/marker-icon-2x.png";
import marcadorSombra from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: marcadorIcone,
  iconRetinaUrl: marcadorIcone2x,
  shadowUrl: marcadorSombra,
});

const iconeOrigem = new L.Icon({
  iconUrl: marcadorIcone,
  iconRetinaUrl: marcadorIcone2x,
  shadowUrl: marcadorSombra,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconeDestino = new L.DivIcon({
  className: "destino-pin",
  html: '<div class="destino-pin-icone">🏁</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const iconeCarro = new L.DivIcon({
  className: "carro-pin",
  html: '<div class="carro-pin-icone">🚚</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function ControladorMapa({ foco, aoClicar, onMapaPronto }) {
  const mapa = useMap();
  const primeiroRender = useRef(true);

  useEffect(() => {
    onMapaPronto(mapa);
  }, [mapa, onMapaPronto]);

  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }

    if (foco) {
      mapa.flyTo(foco, Math.max(mapa.getZoom(), 15), { duration: 0.8 });
    }
  }, [foco, mapa]);

  useMapEvents({
    click(evento) {
      aoClicar([evento.latlng.lat, evento.latlng.lng]);
    },
    dblclick() {},
  });

  return null;
}

function MapaRota({
  origem,
  destino,
  rota = [],
  veiculo,
  foco,
  mapaRef,
  aoClicarNoMapa,
}) {
  const mapaPronto = useCallback(
    (mapa) => {
      if (mapaRef) {
        mapaRef.current = mapa;
      }
    },
    [mapaRef]
  );

  const receptor = useCallback(
    (evento) => {
      aoClicarNoMapa?.(evento);
    },
    [aoClicarNoMapa]
  );

  return (
    <MapContainer
      center={origem || [0, 0]}
      zoom={origem ? 15 : 3}
      minZoom={2}
      zoomControl={false}
      className="mapa-render"
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ControladorMapa
        foco={foco}
        aoClicar={receptor}
        onMapaPronto={mapaPronto}
      />
      {origem && <Marker position={origem} icon={iconeOrigem} />}
      {destino && <Marker position={destino} icon={iconeDestino} />}
      {veiculo && <Marker position={veiculo} icon={iconeCarro} />}
      {rota.length > 0 && (
        <Polyline
          positions={rota}
          pathOptions={{ color: "#4c9828", weight: 6 }}
        />
      )}
    </MapContainer>
  );
}

export default MapaRota;
export { iconeOrigem, iconeDestino, iconeCarro };
