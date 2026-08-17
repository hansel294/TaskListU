// Debe usarse SIEMPRE después de verificarToken, ya que depende de req.usuarioRol.
function verificarAdmin(req, res, next) {
  if (req.usuarioRol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos de administrador' });
  }
  next();
}

module.exports = verificarAdmin;
