import axios from "axios";

interface GenerateMatchButonProps {
  status: boolean;
  onSuccess: () => void;
  id: string;
  hasMatches: boolean; // Add this new prop
}

function GenerateMatchButon({
  status,
  onSuccess,
  id,
  hasMatches,
}: GenerateMatchButonProps) {
  const tournametId = parseInt(id || "0", 10);
  const handleGenerateMatches = async (e: any) => {
    e.preventDefault();
    const res = await axios.post(
      `http://192.168.56.101:8000/tournament/${tournametId}/generate_matches`
    );
    console.log(res);
    onSuccess();
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleGenerateMatches}
      disabled={status || hasMatches} // Add hasMatches to disabled condition
      title={hasMatches ? "Ya existen partidas generadas" : "Generar partidas"}
    >
      <i className="bi bi-plus-circle me-2"></i>
      Crear partidas
    </button>
  );
}

export default GenerateMatchButon;
