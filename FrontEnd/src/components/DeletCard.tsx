import axios from "axios";

type propsDeletCard = {
  id: string;
  cardtype: string;
  onSuccess: () => void;
};

function deletCard(props: propsDeletCard) {
  const { id, onSuccess, cardtype } = props;
  const handleclic = async (e: any) => {
    e.preventDefault();
    const res = await axios.delete(`${import.meta.env.VITE_BACKEND_SERVER}/${cardtype}/${id}`);
    console.log(res);
    onSuccess();
  };

  return (
    <button className="btn btn-danger" onClick={handleclic}>
      Eliminar {cardtype}
    </button>
  );
}

export default deletCard;
