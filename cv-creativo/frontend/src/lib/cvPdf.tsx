import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/stylesheet";
import type { Entry, RoomObject } from "@/lib/room";

// Keep words whole (react-pdf hyphenates aggressively by default).
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = "#FF2A6D";
const SIDEBAR = "#1E293B";
const INK = "#1F2937";
const MUTED = "#64748B";

/** Which room objects feed each CV section. `showCategory` = the category is an institution name. */
const EXPERIENCE = [
  { key: "maletin", showCategory: false },
  { key: "balon", showCategory: true },
];
const EDUCATION = [
  { key: "apuntes", showCategory: false },
  { key: "claqueta", showCategory: true },
  { key: "flauta", showCategory: true },
];
// "ordenador" (aficiones) is intentionally left out of the CV.

const s = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 9.5, color: INK },
  sidebarBg: { position: "absolute", top: 0, left: 0, bottom: 0, width: "34%", backgroundColor: SIDEBAR },
  sidebar: { width: "34%", paddingTop: 36, paddingHorizontal: 22, paddingBottom: 30, color: "#E2E8F0" },
  main: { width: "66%", paddingTop: 36, paddingHorizontal: 30, paddingBottom: 30 },
  photo: { width: 116, height: 116, borderRadius: 58, objectFit: "cover", alignSelf: "center", marginBottom: 18, border: `3pt solid ${ACCENT}` },
  sideTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#FFFFFF", letterSpacing: 1.2, marginTop: 16, marginBottom: 6, paddingBottom: 4, borderBottom: `1pt solid ${ACCENT}` },
  sideLine: { fontSize: 8.8, lineHeight: 1.45, color: "#CBD5E1" },
  sideNote: { fontSize: 8, color: "#94A3B8", marginTop: 2 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 24, color: INK },
  role: { fontSize: 10, color: ACCENT, letterSpacing: 3, marginTop: 4, marginBottom: 6 },
  rule: { height: 2, width: 48, backgroundColor: ACCENT, marginBottom: 10 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, color: INK, letterSpacing: 1.2, marginTop: 14, marginBottom: 8, paddingBottom: 4, borderBottom: "1pt solid #E2E8F0" },
  entry: { marginBottom: 10, paddingLeft: 9, borderLeft: `2pt solid ${ACCENT}` },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: INK },
  entryOrg: { fontSize: 9, color: ACCENT, marginTop: 1 },
  line: { fontSize: 9, lineHeight: 1.45, color: "#374151" },
  bulletRow: { flexDirection: "row", marginTop: 1 },
  bullet: { width: 9, fontSize: 9, color: ACCENT },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4, color: "#374151" },
});

const SIDE_BULLET: Style = { ...s.sideLine, flex: 1 };

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const isBullet = (l: string) => /^[-•·*]\s*/.test(l);
const stripBullet = (l: string) => l.replace(/^[-•·*]\s*/, "");

function Lines({ text, bulletStyle = s.bulletText, lineStyle = s.line }: { text: string; bulletStyle?: Style; lineStyle?: Style }) {
  return (
    <>
      {lines(text).map((l, i) =>
        isBullet(l) ? (
          <View key={i} style={s.bulletRow} wrap={false}>
            <Text style={s.bullet}>•</Text>
            <Text style={bulletStyle}>{stripBullet(l)}</Text>
          </View>
        ) : (
          <Text key={i} style={lineStyle}>
            {l}
          </Text>
        ),
      )}
    </>
  );
}

function MainEntry({ entry, org }: { entry: Entry; org?: string }) {
  return (
    <View style={s.entry} wrap={false}>
      <Text style={s.entryTitle}>{entry.title}</Text>
      {org ? <Text style={s.entryOrg}>{org}</Text> : null}
      <Lines text={entry.description} />
    </View>
  );
}

function SideSection({ title, obj, showCategory }: { title: string; obj?: RoomObject; showCategory?: boolean }) {
  if (!obj) return null;
  return (
    <View>
      <Text style={s.sideTitle}>{title.toUpperCase()}</Text>
      {obj.entries.map((e, i) => (
        <View key={i} style={{ marginBottom: 4 }}>
          <Lines text={e.description} lineStyle={s.sideLine} bulletStyle={SIDE_BULLET} />
        </View>
      ))}
      {showCategory && obj.category ? <Text style={s.sideNote}>{obj.category}</Text> : null}
    </View>
  );
}

function CvDocument({ objects }: { objects: RoomObject[] }) {
  const get = (k: string) => objects.find((o) => o.key === k);
  const personal = get("cartera");
  const name = personal?.entries[0]?.title ?? "Curriculum Vitae";
  const section = (title: string, list: { key: string; showCategory: boolean }[]) => {
    const items = list.flatMap(({ key, showCategory }) => {
      const o = get(key);
      return o ? o.entries.map((e) => ({ e, org: showCategory ? o.category : undefined })) : [];
    });
    if (!items.length) return null;
    return (
      <View>
        <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
        {items.map(({ e, org }, i) => (
          <MainEntry key={i} entry={e} org={org} />
        ))}
      </View>
    );
  };

  return (
    <Document title={`CV - ${name}`} author={name} subject="Curriculum Vitae">
      <Page size="A4" style={s.page}>
        <View style={s.sidebarBg} fixed />
        <View style={s.sidebar}>
          {personal?.image ? <Image src={personal.image} style={s.photo} /> : null}
          {personal ? (
            <View>
              <Text style={s.sideTitle}>CONTACTO</Text>
              {personal.entries.map((e, i) => (
                <Lines key={i} text={e.description} lineStyle={s.sideLine} bulletStyle={SIDE_BULLET} />
              ))}
            </View>
          ) : null}
          <SideSection title="Idiomas" obj={get("diccionario")} />
          <SideSection title="Capacidades" obj={get("silla")} />
          <SideSection title="Permiso de conducción" obj={get("coche")} showCategory />
        </View>
        <View style={s.main}>
          <Text style={s.name}>{name}</Text>
          <Text style={s.role}>CURRICULUM VITAE</Text>
          <View style={s.rule} />
          {section("Experiencia", EXPERIENCE)}
          {section("Educación y formación", EDUCATION)}
        </View>
      </Page>
    </Document>
  );
}

export async function downloadCv(objects: RoomObject[]) {
  const blob = await pdf(<CvDocument objects={objects} />).toBlob();
  const name = objects.find((o) => o.key === "cartera")?.entries[0]?.title ?? "CV";
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CV-${slug || "curriculum"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
