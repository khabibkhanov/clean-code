/**
 * Kontent tekshiruvi: har bir kurs uchun syllabus, manbalar va dars fayllarini
 * sxema va qoidalar bo'yicha tekshiradi.
 *
 * Ishlatish:
 *   npx tsx scripts/validate-content.ts            - barcha kurslar, yozilmagan darslarni ham xato deb hisoblaydi
 *   npx tsx scripts/validate-content.ts --partial  - faqat mavjud dars fayllarini tekshiradi
 *   npx tsx scripts/validate-content.ts --from 21 --to 30 - faqat shu oraliqdagi darslar
 */
import fs from "node:fs";
import matter from "gray-matter";
import {
  flattenSyllabus,
  getCourse,
  getSources,
  lessonPath,
  listCourseSlugs,
} from "../src/lib/content/loader";
import {
  lessonFrontmatterSchema,
  REQUIRED_SECTIONS,
} from "../src/lib/content/schema";

const MIN_BODY_WORDS = 1100;
const FORBIDDEN_DASHES = /[—–]/; // em-dash va en-dash taqiqlangan

function argValue(name: string): number | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : Number(process.argv[i + 1]);
}

const partial = process.argv.includes("--partial");
const from = argValue("--from") ?? 1;
const to = argValue("--to") ?? Number.MAX_SAFE_INTEGER;

const errors: string[] = [];
let checked = 0;

function validateBody(where: string, body: string) {
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  for (const section of REQUIRED_SECTIONS) {
    if (!headings.some((h) => h.startsWith(section))) {
      errors.push(`${where}: "## ${section}" bo'limi yo'q`);
    }
  }
  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean)
    .length;
  if (words < MIN_BODY_WORDS) {
    errors.push(`${where}: matn juda qisqa (${words} so'z, kamida ${MIN_BODY_WORDS})`);
  }
  if (!/```(ts|tsx|js|typescript)\n/.test(body)) {
    errors.push(`${where}: kamida bitta ts/tsx kod bloki bo'lishi kerak`);
  }
}

for (const courseSlug of listCourseSlugs()) {
  const course = getCourse(courseSlug);
  const sources = getSources(courseSlug);
  const syllabus = flattenSyllabus(course);

  syllabus.forEach((entry, i) => {
    if (entry.n !== i + 1) errors.push(`${courseSlug}: dars raqami ketma-ket emas (${entry.n})`);
    for (const id of entry.sources) {
      if (!sources[id]) errors.push(`${courseSlug}#${entry.n}: syllabusda noma'lum manba "${id}"`);
    }
  });

  for (const entry of syllabus) {
    if (entry.n < from || entry.n > to) continue;
    const file = lessonPath(courseSlug, entry);
    const where = `${courseSlug}#${entry.n} (${entry.slug})`;
    if (!fs.existsSync(file)) {
      if (!partial) errors.push(`${where}: fayl yo'q`);
      continue;
    }
    checked++;
    const raw = fs.readFileSync(file, "utf8");
    if (FORBIDDEN_DASHES.test(raw)) {
      errors.push(`${where}: em-dash/en-dash ishlatilgan, faqat "-" ruxsat`);
    }
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch (e) {
      errors.push(`${where}: frontmatter YAML xato: ${(e as Error).message}`);
      continue;
    }
    const result = lessonFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${where}: ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }
    const fm = result.data;
    if (fm.n !== entry.n) errors.push(`${where}: frontmatter n=${fm.n} mos emas`);
    if (fm.slug !== entry.slug) errors.push(`${where}: frontmatter slug mos emas`);
    for (const s of fm.sources) {
      if (!sources[s.id]) errors.push(`${where}: noma'lum manba "${s.id}"`);
    }
    validateBody(where, parsed.content);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} ta xato, ${checked} ta dars tekshirildi`);
  process.exit(1);
}
console.log(`OK: ${checked} ta dars tekshirildi`);
