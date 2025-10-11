import { Link } from "react-router-dom";


function Footer() {
    return (
        <footer className="bg-blue-900 text-white mt-12">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-blue-700 pb-8">

                    {/* Columna 1: Logo y Eslogan (Simplificado) */}
                    <div>
                        <h4 className="text-2xl font-bold text-yellow-400">SkillNet</h4>
                        <p className="text-sm mt-2 text-blue-300">
                            Conectando talento local con tus necesidades.
                        </p>
                        {/* ❌ Eliminamos el div con los íconos de redes sociales */}
                    </div>



                    {/* Columna 3: Soporte y Ayuda */}
                    <div className="md:col-start-4">
                        <h5 className="text-lg font-semibold mb-3">Legal</h5>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/terms" className="hover:text-yellow-400 transition">Términos de Servicio</Link></li>
                            <li><Link to="/privacy" className="hover:text-yellow-400 transition">Política de Privacidad</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Derechos de Autor */}
                <div className="mt-8 text-center text-sm text-blue-300">
                    &copy; {new Date().getFullYear()} SkillNet. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}

export default Footer