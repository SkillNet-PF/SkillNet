import { Link } from "react-router-dom"; // Importamos Link si necesitas que sean rutas
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";

function Hero() {
  const theme = useTheme();
  const heroBg = theme.palette.primary.dark; // Consistente con el brand
  const shadow = alpha("#000", 0.25);
  return (
    // Fondo toma el color del tema para consistencia entre modos
    <section style={{ backgroundColor: heroBg, boxShadow: `inset 0 -1px 0 ${shadow}` }} className="flex flex-col items-center justify-center text-center py-28 md:py-36 px-6 text-white min-h-screen-70">
      
      {/* Título Principal */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-5 drop-shadow-xl max-w-4xl">
        Soluciones de <span className="text-yellow-400">Mantenimiento</span> y <span className="text-yellow-400">Reparación</span> al instante
      </h1>
      
      <p className="text-xl md:text-2xl max-w-3xl mb-10 font-light opacity-90">
        Conecta con profesionales verificados para cualquier servicio que necesites, o impulsa tu carrera como proveedor en SkillNet.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        
       
        <Link 
          to="/login" 
          className="bg-yellow-400 text-blue-900 text-xl font-bold px-8 py-3 rounded-full shadow-2xl hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
        >
          Solicitar un Servicio
        </Link>
        
      
        <Link 
          to="/register/provider" 
          className="bg-transparent border-2 border-white text-white text-xl font-bold px-8 py-3 rounded-full hover:bg-white hover:text-blue-900 transition duration-300 transform hover:scale-105"
        >
          Ofrece tus Servicios
        </Link>
      </div>
      
    </section>
  );
}

export default Hero;