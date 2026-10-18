import { useCallback, useEffect, useState } from "react";

const MENSAGENS_ERRO = {
  1: "Permissão de localização negada. Libere o acesso no navegador.",
  2: "Não foi possível obter a localização. Verifique o GPS.",
  3: "A busca de localização demorou demais. Tente novamente.",
};

export function useGeolocalizacao() {
  const [posicao, setPosicao] = useState(null);
  const [obtendo, setObtendo] = useState(false);
  const [erro, setErro] = useState(null);

  const obter = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setErro("Este navegador não suporta geolocalização.");
      return;
    }

    setObtendo(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosicao([p.coords.latitude, p.coords.longitude]);
        setObtendo(false);
        setErro(null);
      },
      (e) => {
        setErro(MENSAGENS_ERRO[e.code] || "Erro ao obter localização.");
        setObtendo(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { posicao, obtendo, erro, obter };
}