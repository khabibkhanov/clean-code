# Darslar

O'zbek tilidagi chuqur dasturlash kurslari sayti. Har bir dars: matn, test va amaliy topshiriq. Keyingi dars mashqlar to'g'ri bajarilgandan keyin ochiladi (progress brauzerda saqlanadi).

## Kurslar

- `content/clean-code` - Clean Code, 100 dars
- `content/system-design` - keyingi kurs shu tuzilmada qo'shiladi

## Tuzilma

```
content/<kurs>/course.yaml     syllabus: modullar va darslar
content/<kurs>/sources.yaml    manbalar ro'yxati
content/<kurs>/lessons/*.md    darslar (frontmatter: test, topshiriq, manbalar)
content/<kurs>/AUTHORING.md    dars yozish qoidalari
src/lib/content/               sxema, yuklovchi, markdown
scripts/validate-content.ts    kontent tekshiruvi (build oldidan ishlaydi)
```

Yangi kurs qo'shish: `content/<slug>/` papkasini `course.yaml`, `sources.yaml` va `lessons/` bilan yarating. Sayt uni avtomatik topadi.

## Buyruqlar

```bash
npm run dev        # lokal server
npm run validate   # kontentni tekshirish
npm run build      # tekshiruv + production build
```
