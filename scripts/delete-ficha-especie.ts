import {createClient as createSupabaseClient} from "@supabase/supabase-js";
import {Database} from "../src/types/supabase";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({path: ".env.local"});

/**
 * Script para eliminar registros de ficha_especie por ID_Ficha_Especie
 *
 * IDs a eliminar:
 * 30, 39, 45, 574, 52, 60, 80, 501, 91, 103, 106, 333, 346, 511, 431, 581,
 * 112, 124, 133, 541, 170, 223, 190, 192, 194, 198, 199, 244, 292, 296, 298, 291, 320
 */
async function deleteFichaEspecieRecords() {
  const supabaseClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // IDs a eliminar
  const idsToDelete = [
    30, 39, 45, 574, 52, 60, 80, 501, 91, 103, 106, 333, 346, 511, 431, 581,
    112, 124, 133, 541, 170, 223, 190, 192, 194, 198, 199, 244, 292, 296, 298, 291, 320
  ];

  console.log(`🗑️  Iniciando eliminación de ${idsToDelete.length} registros de ficha_especie...`);
  console.log(`📋 IDs a eliminar: ${idsToDelete.join(", ")}`);

  // Verificar que los registros existen antes de eliminar
  const {data: existingRecords, error: selectError} = await supabaseClient
    .from("ficha_especie")
    .select("id_ficha_especie, taxon_id")
    .in("id_ficha_especie", idsToDelete);

  if (selectError) {
    console.error("❌ Error al verificar registros existentes:", selectError);
    return;
  }

  const existingIds = existingRecords?.map((r) => r.id_ficha_especie) || [];
  const missingIds = idsToDelete.filter((id) => !existingIds.includes(id));

  if (missingIds.length > 0) {
    console.warn(`⚠️  Los siguientes IDs no existen en la base de datos: ${missingIds.join(", ")}`);
  }

  if (existingIds.length === 0) {
    console.log("ℹ️  No se encontraron registros para eliminar.");
    return;
  }

  console.log(`✅ Se encontraron ${existingIds.length} registros para eliminar: ${existingIds.join(", ")}`);

  // Eliminar los registros
  const {data: deletedData, error: deleteError} = await supabaseClient
    .from("ficha_especie")
    .delete()
    .in("id_ficha_especie", idsToDelete)
    .select("id_ficha_especie, taxon_id");

  if (deleteError) {
    console.error("❌ Error al eliminar registros:", deleteError);
    console.error("Detalles:", JSON.stringify(deleteError, null, 2));
    return;
  }

  if (deletedData && deletedData.length > 0) {
    console.log(`✅ Se eliminaron exitosamente ${deletedData.length} registros:`);
    deletedData.forEach((record) => {
      console.log(`   - ID: ${record.id_ficha_especie}, taxon_id: ${record.taxon_id}`);
    });
  } else {
    console.log("⚠️  No se eliminaron registros (posiblemente ya no existen).");
  }
}

// Ejecutar el script
deleteFichaEspecieRecords()
  .then(() => {
    console.log("✅ Script completado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });

