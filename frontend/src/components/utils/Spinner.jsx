import { Triangle } from 'react-loader-spinner'
import "../../../static/css/utils/Spinner.css";

export default function Spinner({ visible, color }) {
  if (!visible) return null;

  return (
    <div className="spinner-overlay">
      <Triangle color={color} height={90} width={90} />
    </div>
  );
}