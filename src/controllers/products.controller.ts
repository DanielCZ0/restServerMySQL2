import { Request, Response } from 'express';
import { dbPool } from '../conf/dbConnection.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// 1. Obtener todos los productos activos
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, name, price, stock, description, brand, img, active FROM products WHERE active = TRUE');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 2. Obtener producto activo por ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const numId = Number(id);

    // Validar ID positivo
    if (!Number.isInteger(numId) || numId <= 0) {
      res.status(400).json({ message: 'El ID debe ser un entero positivo' });
      return;
    }

    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, name, price, stock, description, brand, img, active FROM products WHERE id = ? AND active = TRUE',[numId]);

    if (rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado o inactivo' });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 3. Crear nuevo producto
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, stock, description, brand, img } = req.body;
    const numPrice = Number(price);

    // Validaciones
    if (!name || !description || stock === undefined || price === undefined) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ message: 'El precio debe ser un número mayor a cero' });
      return;
    }

    const [result] = await dbPool.query<ResultSetHeader>(
      'INSERT INTO products (name, price, stock, description, brand, img, active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [name, numPrice, stock, description, brand || null, img || null]);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 4. Actualizar producto completo
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    const { name, price, stock, description, brand, img } = req.body;
    const numPrice = Number(price);

    if (!Number.isInteger(numId) || numId <= 0) {
      res.status(400).json({ message: 'El ID debe ser un entero positivo' });
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ message: 'El precio debe ser un número mayor a cero' });
      return;
    }

    const [result] = await dbPool.query<ResultSetHeader>(
      `UPDATE products 
       SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? 
       WHERE id = ? AND active = TRUE`,
      [name, numPrice, stock, description, brand || null, img || null, numId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado o inactivo' });
      return;
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 5. Baja lógica (Soft Delete)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      res.status(400).json({ message: 'El ID debe ser un entero positivo' });
      return;
    }
    const [result] = await dbPool.query<ResultSetHeader>(
      'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
      [numId]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado o ya inactivo' });
      return;
    }
    res.status(200).json({ message: 'Producto dado de baja lógicamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 6. Cambiar precio exclusivamente (PATCH)
export const changePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    const { price } = req.body;
    const numPrice = Number(price);
    if (!Number.isInteger(numId) || numId <= 0) {
      res.status(400).json({ message: 'El ID debe ser un entero positivo' });
      return;
    }
    if (price === undefined || isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ message: 'El precio debe ser un número válido mayor a cero' });
      return;
    }
    const [result] = await dbPool.query<ResultSetHeader>(
      'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
      [numPrice, numId]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado o inactivo' });
      return;
    }
    res.status(200).json({ message: 'Precio actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};