function Home() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-yellow-300">Skillnet</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-8">
                        Solicita fácilmente nuestros servicios de mantenimiento.
                    </p>
                    <a
                        href="#services"
                        className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 rounded-lg shadow hover:bg-yellow-300 transition"
                    >
                        Ver Servicios
                    </a>
                </div>
            </section>

            {/* Servicios */}
            <section id="services" className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
                            <h3 className="text-xl font-semibold mb-4">Mantenimiento Técnico</h3>
                            <p className="text-gray-600">Reparación y soporte técnico para tus equipos y dispositivos.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
                            <h3 className="text-xl font-semibold mb-4">Servicios Eléctricos</h3>
                            <p className="text-gray-600">Instalaciones y reparaciones eléctricas seguras y confiables.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
                            <h3 className="text-xl font-semibold mb-4">Plomería</h3>
                            <p className="text-gray-600">Soluciones rápidas y efectivas para problemas de agua y tuberías.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
