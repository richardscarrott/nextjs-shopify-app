import fs from "fs/promises";
import path from "path";

// NOTE: This is expected to read / write to your application DB.

export interface ShopRecord {
  readonly shop: string;
  readonly accessToken: string;
  readonly scope: string;
}

const dbPath = path.join(process.cwd(), "./db");

export const save = async (record: ShopRecord) => {
  await fs.writeFile(
    path.join(dbPath, `./${record.shop}`),
    JSON.stringify(record, null, 2)
  );
};

export const find = async (shop: string): Promise<ShopRecord | undefined> => {
  try {
    const result = await fs.readFile(path.join(dbPath, `./${shop}`));
    return JSON.parse(result.toString());
  } catch (ex) {}
};
