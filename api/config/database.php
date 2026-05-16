<?php
class Database {
    // Configuración para el repositorio público
    // Las credenciales reales se manejan en el servidor de producción (Hostinger)
    private $host = "localhost";
    private $db_name = "tu_base_de_datos";
    private $username = "tu_usuario";
    private $password = "tu_contraseña_secreta";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo json_encode(array("success" => false, "message" => "Error PDO: " . $exception->getMessage()));
            exit;
        }
        return $this->conn;
    }
}
?>