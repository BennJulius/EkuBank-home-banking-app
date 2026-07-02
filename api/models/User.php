<?php
class User {
    private $conn;
    public $dni;
    public $password;

    public function __construct($db) { $this->conn = $db; }

    public function login() {
        // Busca por DNI o por Número de Tarjeta (derivado del número de cuenta de ahorros)
        $query = "SELECT u.id, u.password_hash, p.nombres, p.dni, c.saldo
                  FROM usuarios_mock u
                  JOIN perfiles_clientes p ON u.id = p.user_id
                  LEFT JOIN cuentas c ON u.id = c.user_id
                  WHERE p.dni = :dni OR REPLACE(c.numero_cuenta, '019-', '') = SUBSTRING(:dni, 7, 7)
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':dni', $this->dni);
        $stmt->execute();
        return $stmt;
    }
}
?>
