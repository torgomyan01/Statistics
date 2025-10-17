import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "StatisticsDB";
const DB_VERSION = 1;
const STORE_INDICATORS = "indicators";

interface IndicatorRecord {
  code: string;
  rows: any[]; // ICountryData[] but keep loose to avoid circular type import
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_INDICATORS)) {
          db.createObjectStore(STORE_INDICATORS, { keyPath: "code" });
        }
      },
    });
  }
  return dbPromise;
}

export async function idbGetIndicatorRows(code: string): Promise<any[] | null> {
  try {
    const db = await getDb();
    const rec = (await db.get(STORE_INDICATORS, code)) as
      | IndicatorRecord
      | undefined;
    return rec?.rows ?? null;
  } catch {
    return null;
  }
}

export async function idbSetIndicatorRows(
  code: string,
  rows: any[],
): Promise<void> {
  try {
    const db = await getDb();
    const rec: IndicatorRecord = { code, rows };
    await db.put(STORE_INDICATORS, rec);
  } catch {
    // ignore write errors
  }
}

export async function idbGetManyIndicators(
  codes: string[],
): Promise<Map<string, any[]>> {
  const result = new Map<string, any[]>();
  try {
    const db = await getDb();
    await Promise.all(
      codes.map(async (code) => {
        try {
          const rec = (await db.get(STORE_INDICATORS, code)) as
            | IndicatorRecord
            | undefined;
          if (rec?.rows?.length) {
            result.set(code, rec.rows);
          }
        } catch {
          // ignore
        }
      }),
    );
  } catch {
    // ignore
  }
  return result;
}
// import { openDB } from "idb";
//
// const DB_NAME = "EllixDB";
// const STORE_NAME = "Ellix";
//
// export async function getDb() {
//   return openDB(DB_NAME, 1, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         db.createObjectStore(STORE_NAME, {
//           keyPath: "id",
//           autoIncrement: true,
//         });
//       }
//     },
//   });
// }
//
// export async function setHomeSliderPosts(data: IPost[]) {
//   const db = await getDb();
//   await db.put(STORE_NAME, data);
// }
//
// export async function getHomeSliderPosts() {
//   const db = await getDb();
//   return db.getAll(STORE_NAME);
// }
