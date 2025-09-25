// "use server";
//
// import { prisma } from "@/lib/prisma";
// import data from "@/access/output.json";
//
// export async function ActionAddDataToDb() {
//   try {
//     const dataCountries: any = data;
//     const startIndex = 45499; // Սահմանում ենք սկզբնական ինդեքսը
//
//     // Օգտագործում ենք սովորական for ցիկլ՝ սկզբնական ինդեքսը կառավարելու համար
//     for (let i = startIndex; i < dataCountries.length; i++) {
//       const item: any = dataCountries[i];
//
//       // Սպասում ենք, որ տվյալների ներբեռնումը ավարտվի
//       await prisma.countries.create({
//         data: {
//           country_name: item["Country Name"],
//           country_code: item["Country Code"],
//           Indicator_name: item["Indicator Name"],
//           indicator_code: item["Indicator Code"],
//           object: item,
//         },
//       });
//
//       console.log(
//         `Successfully added data for: ${item["Country Name"]} at index ${i}`,
//       );
//     }
//
//     // Այս կոդը կաշխատի միայն այն ժամանակ, երբ ամբողջ ցիկլը ավարտվի
//     return {
//       status: "ok",
//       data: { message: "All data successfully uploaded" },
//       error: "",
//     };
//   } catch (error) {
//     console.error("Error in ActionAddDataToDb:", error);
//     return {
//       status: "error",
//       data: null,
//       error: error.message || "An unknown error occurred",
//     };
//   }
// }
