import { useEffect, useRef, useState } from "react";

import { buscarEnderecos } from "../lib/geocode";

function BuscarEndereco({
  value,
  onAlterar,
  aoEscolher,
  programatica,
  placeholder,
}) {
  const [sugestoes, setSugestoes] = useState([]);
  const timerBusca = useRef(null);

  useEffect(() => {
    if (programatica) {
      setSugestoes([]);
      return;
    }

    const texto = value.trim();

    if (texto.length < 3) {
      setSugestoes([]);
      return;
    }

    clearTimeout(timerBusca.current);
    timerBusca.current = setTimeout(async () => {
      setSugestoes(await buscarEnderecos(texto));
    }, 500);

    return () => clearTimeout(timerBusca.current);
  }, [value, programatica]);

  function escolher(item) {
    aoEscolher(item);
    setSugestoes([]);
  }

  return (
    <div className="mapa-buscar">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onAlterar(event.target.value)}
      />

      {sugestoes.length > 0 && (
        <ul className="mapa-sugestoes">
          {sugestoes.map((item, indice) => (
            <li key={indice}>
              <button type="button" onClick={() => escolher(item)}>
                {item.rotulo}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BuscarEndereco;
