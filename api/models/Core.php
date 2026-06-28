<?php
class Core {
    private $conn;

    public function __construct($db) { $this->conn = $db; }

    // Obtener ranking de clientes por mejor línea de crédito (Score)
    public function getMejoresLineas() {
        $query = "SELECT nombre_cliente, tipo_negocio, score_transaccional, segmento_preliminar, monto_hipotesis 
                  FROM vw_pbi_universo_scoring 
                  ORDER BY score_transaccional DESC LIMIT 20";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Obtener peticiones de crédito (Fichas de campo)
    public function getPeticionesCredito() {
        $query = "SELECT id_ficha, fecha_visita, nombre_cliente, score_final, segmento_resultante, monto_aprobado_propuesto, comite_resolucion 
                  FROM vw_pbi_fichas_campo 
                  ORDER BY fecha_visita DESC LIMIT 20";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>