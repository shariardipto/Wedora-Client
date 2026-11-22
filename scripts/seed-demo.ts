/**
 * Seeds demo content so the live site has real listings to browse:
 * 6 vendors (one per category), 11 approved + 2 pending services, and one
 * demo customer with a few booking requests.
 *
 *   npm run seed:demo              # create whatever is missing (idempotent)
 *   npm run seed:demo -- --reset   # delete every demo record (isDemo: true)
 *
 * Photos are free-to-use Unsplash images (Unsplash License). They are copied
 * to ImgBB through the same upload helper the app uses, because services may
 * only reference i.ibb.co images. Nothing is seeded as Premium: only Stripe's
 * webhook can grant it (BR-14). Demo accounts use DEMO_PASSWORD if set,
 * otherwise a random password (they exist for display, not for sign-in).
 */
import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { getAuth } from "@/lib/auth/server";
import { passwordSchema } from "@/lib/auth/validation";
import { closeAuthDatabase, getAuthDatabase } from "@/lib/database";
import { uploadToImgbb } from "@/lib/image-upload";
import { serviceFormSchema, type ServiceFormValues } from "@/lib/services/validation";

type DemoService = ServiceFormValues & {
  status: "approved" | "pending";
  /** Unsplash photo ids (the part after "photo-"). */
  photos: string[];
};

type DemoVendor = {
  name: string;
  email: string;
  businessName: string;
  phone: string;
  services: DemoService[];
};

const VENDORS: DemoVendor[] = [
  {
    name: "Maya Thompson",
    email: "maya@ivorylens.example.com",
    businessName: "Ivory Lens Studio",
    phone: "+1 (512) 555-0182",
    services: [
      {
        serviceName: "Golden Hour Wedding Photography",
        category: "photography-videography",
        price: 3800,
        location: "Austin, TX",
        status: "approved",
        description:
          "Full-day coverage from getting ready to the last dance, with two photographers so no moment is missed. Includes a golden-hour portrait session, an online gallery of 600+ edited images within six weeks, and a printed 30-page heirloom album.",
        photos: ["1591604466107-ec97de577aff", "1532712938310-34cb3982ef74", "1460978812857-470ed1c77af0"],
      },
      {
        serviceName: "Cinematic Wedding Films",
        category: "photography-videography",
        price: 4500,
        location: "Austin, TX",
        status: "approved",
        description:
          "A story-driven wedding film shot by a two-person crew with drone footage where venues allow. You receive a 5-minute highlight film, the full ceremony and speeches edit, and a teaser for social media within two weeks.",
        photos: ["1537633552985-df8429e8048b", "1520854221256-17451cc331bf"],
      },
      {
        serviceName: "Engagement Portrait Session",
        category: "photography-videography",
        price: 650,
        location: "Austin, TX",
        status: "pending",
        description:
          "A relaxed 90-minute engagement session at a location of your choice in the Austin area, with outfit guidance beforehand and 80+ edited images delivered in a private gallery.",
        photos: ["1583939003579-730e3918a45a"],
      },
    ],
  },
  {
    name: "Daniel Reyes",
    email: "events@willowcreek.example.com",
    businessName: "Willow Creek Estate",
    phone: "+1 (512) 555-0129",
    services: [
      {
        serviceName: "Garden Lawn Ceremony Venue",
        category: "venues",
        price: 9500,
        location: "Dripping Springs, TX",
        status: "approved",
        description:
          "An open lawn ceremony site framed by oak trees, seating up to 180 guests. Includes white garden chairs, a rehearsal slot the day before, a bridal suite for getting ready, and a dedicated venue coordinator on the day.",
        photos: ["1522673607200-164d1b6ce486", "1469371670807-013ccf25f16a"],
      },
      {
        serviceName: "Rotunda Pavilion & Poolside Reception",
        category: "venues",
        price: 14000,
        location: "Dripping Springs, TX",
        status: "approved",
        description:
          "Say your vows under the domed garden rotunda, then move to the poolside terrace for cocktails and dinner. Covered pavilion for up to 220 guests, dance floor, string lighting and an indoor rain plan are included.",
        photos: ["1523438885200-e635ba2c371e", "1511285560929-80b456fea0bc"],
      },
    ],
  },
  {
    name: "Sofia Bennett",
    email: "hello@petalandtwine.example.com",
    businessName: "Petal & Twine Florals",
    phone: "+1 (210) 555-0164",
    services: [
      {
        serviceName: "Bridal Bouquets & Boutonnieres",
        category: "decoration-florist",
        price: 850,
        location: "San Antonio, TX",
        status: "approved",
        description:
          "Hand-tied bridal bouquet in seasonal blooms, four bridesmaid bouquets and six boutonnieres, designed around your palette after a one-hour consultation. Delivered fresh on the morning of the wedding.",
        photos: ["1525258946800-98cfd641d0de", "1519741497674-611481863552"],
      },
      {
        serviceName: "Rustic Signage & Reception Styling",
        category: "decoration-florist",
        price: 2400,
        location: "San Antonio, TX",
        status: "approved",
        description:
          "Welcome and directional signs in reclaimed wood, ceremony aisle florals, and reception styling with candles and greenery runners. Setup and teardown by our team are included.",
        photos: ["1507504031003-b417219a0fde"],
      },
    ],
  },
  {
    name: "Marcus Allen",
    email: "catering@harvesttable.example.com",
    businessName: "Harvest Table Catering",
    phone: "+1 (713) 555-0147",
    services: [
      {
        serviceName: "Grand Buffet Reception Package",
        category: "catering",
        price: 6200,
        location: "Houston, TX",
        status: "approved",
        description:
          "A chef-attended buffet for up to 120 guests: three passed appetizers, two mains, three seasonal sides and a salad station, with linens, tableware and service staff. Vegetarian, vegan and gluten-free options available.",
        photos: ["1555244162-803834f70033", "1519225421980-715cb0215aed"],
      },
      {
        serviceName: "Late-Night Dessert Bar",
        category: "catering",
        price: 1200,
        location: "Houston, TX",
        status: "pending",
        description:
          "A self-serve dessert bar for the end of the night with mini pastries, cookies and a hot cocoa station, styled to match your reception and staffed for two hours.",
        photos: ["1555244162-803834f70033"],
      },
    ],
  },
  {
    name: "Aaliyah Brooks",
    email: "book@glowandgrace.example.com",
    businessName: "Glow & Grace Beauty",
    phone: "+1 (214) 555-0193",
    services: [
      {
        serviceName: "Bridal Makeup & Hair Artistry",
        category: "makeup-styling",
        price: 950,
        location: "Dallas, TX",
        status: "approved",
        description:
          "Long-wear airbrush or traditional makeup and a bridal hairstyle, with a full trial session two to six weeks before the wedding. On-location service and a touch-up kit for the day are included.",
        photos: ["1487412947147-5cebf100ffc2", "1545232979-8bf68ee9b1af"],
      },
      {
        serviceName: "Rehearsal & Reception Look Styling",
        category: "makeup-styling",
        price: 480,
        location: "Dallas, TX",
        status: "approved",
        description:
          "A second look for your rehearsal dinner or reception change: makeup refresh, hair restyle and outfit styling advice, so you feel fresh from the first toast to the send-off.",
        photos: ["1478146896981-b80fe463b330"],
      },
    ],
  },
  {
    name: "Claire Dubois",
    email: "atelier@maisonblanche.example.com",
    businessName: "Maison Blanche Bridal",
    phone: "+1 (817) 555-0158",
    services: [
      {
        serviceName: "Custom Bridal Gown Design",
        category: "fashion",
        price: 3200,
        location: "Fort Worth, TX",
        status: "approved",
        description:
          "A made-to-measure gown designed with you from sketch to final fitting. Includes fabric selection, three fittings, bustle and hem adjustments, and steaming before delivery.",
        photos: ["1594552072238-b8a33785b261"],
      },
      {
        serviceName: "Wedding Bands & Bridal Accessories",
        category: "fashion",
        price: 1500,
        location: "Fort Worth, TX",
        status: "approved",
        description:
          "Matching wedding bands in 14k gold or platinum with complimentary engraving, plus a curated set of bridal accessories: veil, hair piece and jewelry styled to your gown.",
        photos: ["1606800052052-a08af7148866", "1465495976277-4387d4b0b4c6"],
      },
    ],
  },
];

const CUSTOMER = { name: "Emma Carter", email: "emma.carter@couples.example.com" };

/** Booking requests from the demo customer: [service name, status, event date]. */
const BOOKINGS: Array<[string, "pending" | "accepted", string, string]> = [
  ["Golden Hour Wedding Photography", "accepted", "2027-04-17", "Dripping Springs, TX"],
  ["Garden Lawn Ceremony Venue", "pending", "2027-04-17", "Dripping Springs, TX"],
  ["Bridal Makeup & Hair Artistry", "pending", "2027-04-17", "Dripping Springs, TX"],
];

function demoPassword(): string {
  const fromEnv = process.env.DEMO_PASSWORD?.trim();
  if (fromEnv) {
    const check = passwordSchema.safeParse(fromEnv);
    if (!check.success) throw new Error(`DEMO_PASSWORD: ${check.error.issues[0]?.message}`);
    return check.data;
  }
  return `Demo${randomBytes(12).toString("base64url")}x`;
}

async function ensureUser(
  name: string,
  email: string,
  accountType: "vendor" | "customer",
  extra: Record<string, unknown>,
  password: string,
): Promise<ObjectId> {
  const auth = getAuth();
  const ctx = await auth.$context;
  const users = getAuthDatabase().collection("user");

  const existing = await users.findOne({ email });
  if (existing && existing.isDemo !== true) {
    throw new Error(`${email} belongs to a real account; refusing to modify it.`);
  }
  let id = existing?._id as ObjectId | undefined;
  if (!id) {
    const result = await auth.api.signUpEmail({ body: { name, email, password, accountType } as never });
    id = new ObjectId(result.user.id);
    await ctx.internalAdapter.deleteUserSessions(result.user.id);
    console.info(`  + ${accountType} ${name}`);
  }
  await users.updateOne(
    { _id: id },
    { $set: { ...extra, isDemo: true, emailVerified: true, isBlocked: false, updatedAt: new Date() } },
  );
  return id;
}

const uploaded = new Map<string, string>();

/** Fetches an Unsplash photo and re-hosts it on ImgBB (once per photo per run). */
async function hostPhoto(photoId: string, label: string): Promise<string> {
  const cached = uploaded.get(photoId);
  if (cached) return cached;
  const response = await fetch(`https://images.unsplash.com/photo-${photoId}?w=1600&q=80&fm=jpg&fit=max`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Couldn’t download Unsplash photo ${photoId} (HTTP ${response.status}).`);
  const file = new File([await response.arrayBuffer()], `${photoId}.jpg`, { type: "image/jpeg" });
  const result = await uploadToImgbb(file, `wedora-demo-${label}`);
  if (!result.ok) throw new Error(`ImgBB upload failed for ${photoId}: ${result.message}`);
  uploaded.set(photoId, result.url);
  return result.url;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);

async function seed() {
  const db = getAuthDatabase();
  const services = db.collection("services");
  const password = demoPassword();
  console.info(process.env.DEMO_PASSWORD ? "Demo accounts use DEMO_PASSWORD." : "Demo accounts get a random password (set DEMO_PASSWORD to sign in as them).");

  // Newest first on the home page: interleave categories so the top six cover all six.
  const ordered = VENDORS.flatMap((vendor) => vendor.services.map((service, index) => ({ vendor, service, index })))
    .sort((a, b) => a.index - b.index);
  const createdAt = new Map(ordered.map(({ service }, i) => [service.serviceName, new Date(Date.now() - i * 60 * 60 * 1000)]));

  const serviceIds = new Map<string, { id: ObjectId; vendorId: ObjectId }>();
  for (const vendor of VENDORS) {
    console.info(`${vendor.businessName}`);
    const vendorId = await ensureUser(vendor.name, vendor.email, "vendor", { businessName: vendor.businessName, phone: vendor.phone }, password);
    for (const spec of vendor.services) {
      const values = serviceFormSchema.parse(spec);
      const existing = await services.findOne({ vendorId, serviceName: values.serviceName });
      if (existing) {
        serviceIds.set(values.serviceName, { id: existing._id, vendorId });
        console.info(`  = ${values.serviceName} (exists)`);
        continue;
      }
      const images: string[] = [];
      for (const [i, photo] of spec.photos.entries()) images.push(await hostPhoto(photo, `${slug(values.serviceName)}-${i + 1}`));
      const at = createdAt.get(values.serviceName) ?? new Date();
      const { insertedId } = await services.insertOne({
        vendorId,
        ...values,
        images,
        status: spec.status,
        isAvailable: true,
        rejectionReason: null,
        isDemo: true,
        createdAt: at,
        updatedAt: at,
      });
      serviceIds.set(values.serviceName, { id: insertedId, vendorId });
      console.info(`  + ${values.serviceName} (${spec.status}, ${images.length} photo${images.length === 1 ? "" : "s"})`);
    }
  }

  console.info("Demo customer");
  const customerId = await ensureUser(CUSTOMER.name, CUSTOMER.email, "customer", {}, password);
  const bookings = db.collection("bookings");
  for (const [serviceName, status, date, eventLocation] of BOOKINGS) {
    const service = serviceIds.get(serviceName);
    if (!service) continue;
    const eventDate = new Date(`${date}T00:00:00Z`);
    if (await bookings.findOne({ customerId, serviceId: service.id, eventDate })) continue;
    const now = new Date();
    await bookings.insertOne({
      serviceId: service.id,
      vendorId: service.vendorId,
      customerId,
      eventDate,
      eventLocation,
      message: "We’re planning an April garden wedding for about 150 guests and would love to work with you.",
      status,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    });
    console.info(`  + booking: ${serviceName} (${status})`);
  }

  const live = await services.countDocuments({ isDemo: true, status: "approved", isAvailable: true });
  console.info(`Done. ${live} approved demo services are live.`);
}

async function reset() {
  const db = getAuthDatabase();
  const demoUsers = await db.collection("user").find({ isDemo: true }, { projection: { _id: 1 } }).toArray();
  const ids = demoUsers.map((user) => user._id);
  const idStrings = ids.map((id) => id.toHexString());
  const [b, s] = await Promise.all([
    db.collection("bookings").deleteMany({ $or: [{ isDemo: true }, { customerId: { $in: ids } }, { vendorId: { $in: ids } }] }),
    db.collection("services").deleteMany({ $or: [{ isDemo: true }, { vendorId: { $in: ids } }] }),
  ]);
  await db.collection("session").deleteMany({ userId: { $in: [...ids, ...idStrings] } });
  await db.collection("account").deleteMany({ userId: { $in: [...ids, ...idStrings] } });
  const u = await db.collection("user").deleteMany({ _id: { $in: ids }, isDemo: true });
  console.info(`Removed ${u.deletedCount} demo users, ${s.deletedCount} services, ${b.deletedCount} bookings.`);
}

(process.argv.includes("--reset") ? reset() : seed())
  .catch((error) => {
    console.error("Demo seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeAuthDatabase());
