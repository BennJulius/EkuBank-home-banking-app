<?php
class User {
    private $conn;
    private $table_name = "usuarios";

    // Propiedades del objeto
    public $id;
    public $nombre;
    public $dni;
    public $password;
    public $saldo;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Método para validar el login
    public function login() {
        $query = "SELECT id, nombre, dni, saldo FROM " . $this->table_name . " WHERE dni = :dni AND password = :password LIMIT 1";
        
        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->dni = htmlspecialchars(strip_tags($this->dni));
        $this->password = htmlspecialchars(strip_tags($this->password));

        // Enlazar parámetros (Binding)
        $stmt->bindParam(':dni', $this->dni);
        $stmt->bindParam(':password', $this->password);

        $stmt->execute();

        return $stmt;
    }
}
?>