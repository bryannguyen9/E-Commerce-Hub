const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: { attributes: [] } },
      ],
    });
    const productWithTags = productData.map((product) => {
      const tagIds = product.Tags.map((tag) => tag.id);
      return { ...product.toJSON(), tagIds };
    });
    res.status(200).json(productWithTags);
  } catch (err) {
    res.status(500).json(err);
  };
});

  // find a single product by its `id`
router.get('/:id', async (req, res) => {
  try {
    const specificProduct = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: { attributes: [] } },
      ],
    });
    if (!specificProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    };
    const tagIds = specificProduct.Tags.map((tag) => tag.id);
    const productWithTags = { ...specificProduct.toJSON(), tagIds };
    res.status(200).json(productWithTags);
  } catch (err) {
    res.status(500).json(err);
  };
});

// create new product
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create({
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
      });
      if(!newProduct){
        res.status(404).json({ message: 'Product not created incorrect fields'});
        return;
      };
      const tagNames = req.body.tags || [];
      const tags = await Tag.findAll({
        where: {
          id: tagNames,
        },
      });
      await newProduct.setTags(tags);
      res.status(200).json(newProduct);
  } catch(err) {
    res.status(500).json(err);
  };
});

  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      };
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });


// update product
router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

  // delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const productToDelete = await Product.findByPk(req.params.id);
    if (!productToDelete) {
      res.status(404).json({ message: 'Product not found' });
      return;
    };
    await Product.destroy({
      where: {
        id: req.params.id
      },
    });
    res.status(200).json({ message: 'Product successfully deleted' });
  } catch (err) {
    res.status(500).json(err);
  };
});

module.exports = router;
