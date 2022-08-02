import { use, wrap } from "../../../utils/use";
import {
  method,
  withVerifiedShopifyClient,
} from "../../../middleware/api-routes";
import { NextApiResponse } from "next";
import Shopify from "shopify-api-node";

export type ProductsApiData = {
  readonly products: Shopify.IPaginatedResult<Shopify.IProduct>;
};

const handler = wrap(
  use(
    method("GET"),
    withVerifiedShopifyClient,
    async (
      req,
      res: NextApiResponse<ProductsApiData>,
      { verifiedShopifyClient }
    ) => {
      const products = await verifiedShopifyClient.product.list();
      res.json({ products });
    }
  )
);

export default handler;
