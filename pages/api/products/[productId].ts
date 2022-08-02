import { NextApiResponse } from "next";
import Shopify from "shopify-api-node";
import { use, wrap } from "../../../utils/use";
import {
  method,
  withVerifiedShopifyClient,
} from "../../../middleware/api-routes";

export type ProductApiData = {
  readonly product: Shopify.IProduct;
};

const handler = wrap(
  use(
    method("GET"),
    withVerifiedShopifyClient,
    async (
      req,
      res: NextApiResponse<ProductApiData>,
      { verifiedShopifyClient }
    ) => {
      const productId = Number(req.query.productId);
      if (Number.isNaN(productId)) {
        res.status(404).end();
        return;
      }
      const product = await verifiedShopifyClient.product.get(productId);
      res.json({ product });
    }
  )
);

export default handler;
