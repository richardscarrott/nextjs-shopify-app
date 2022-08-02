import type { GetServerSideProps, NextPage } from "next";
import { Provider } from "../../components/lib/provider";
import { Banner, Card, DescriptionList, Page } from "@shopify/polaris";
import { Loading, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useSsr, wrapSsr } from "../../utils/use-ssr";
import { requireInstall, withShop } from "../../middleware/ssr";
import { useApi } from "../../utils/use-api";
import { ProductApiData } from "../api/products/[productId]";
import { useRouter } from "next/router";

interface Props {
  readonly host: string;
  readonly shop: string;
  readonly productId: string;
}

export const getServerSideProps: GetServerSideProps<Props> = wrapSsr(
  useSsr(requireInstall, withShop(true), (ctx, { shop, host }) => {
    if (typeof ctx.query.productId !== "string") {
      return { notFound: true };
    }
    return {
      props: {
        shop,
        host,
        productId: ctx.query.productId,
      },
    };
  })
);

const ProductDetailPage: NextPage<Props> = (props) => (
  <Provider embed host={props.host}>
    <ProductDetail {...props} />
  </Provider>
);

export default ProductDetailPage;

const ProductDetail: React.FunctionComponent<Props> = ({
  host,
  shop,
  productId,
}) => {
  const app = useAppBridge();
  const router = useRouter();
  const { error, data } = useApi<ProductApiData>({
    path: `/api/products/${productId}`,
    host,
    shop,
  });
  return (
    <Page
      title="Product Detail"
      breadcrumbs={[
        {
          onAction: () => {
            router.push(`/?shop=${shop}&host=${host}`);
          },
          content: "Products",
        },
      ]}
      primaryAction={{
        content: "Edit",
        disabled: !data,
        onAction: () => {
          const redirect = Redirect.create(app);
          redirect.dispatch(
            Redirect.Action.ADMIN_PATH,
            `/products/${data!.product.id}`
          );
        },
      }}
    >
      {error ? (
        <Banner title="Failed to load product" status="critical" />
      ) : !data ? (
        <Loading />
      ) : (
        <Card title={data.product.title}>
          <Card.Section>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {data.product.image ? (
                <img src={data.product.image.src} width="50%" />
              ) : null}
              <div
                dangerouslySetInnerHTML={{ __html: data.product.body_html }}
              />
            </div>
          </Card.Section>
          <Card.Section subdued>
            <DescriptionList
              items={[
                {
                  term: "Vendor",
                  description: data.product.vendor,
                },
                {
                  term: "Product Type",
                  description: data.product.product_type,
                },
              ]}
            />
          </Card.Section>
        </Card>
      )}
    </Page>
  );
};
