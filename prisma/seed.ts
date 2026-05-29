import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ──────────────────────────────────────────────
  // 1. Roles
  // ──────────────────────────────────────────────
  const adminRole = await prisma.roles.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      role: "ADMIN",
      description: "Full access administrator",
      is_active: true,
    },
  });

  const userRole = await prisma.roles.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      role: "USER",
      description: "Standard user access",
      is_active: true,
    },
  });

  console.log("✅ Roles created");

  // ──────────────────────────────────────────────
  // 2. Admin User
  // ──────────────────────────────────────────────
  const hashedPass = await bcrypt.hash("admin", 10);

  await prisma.users.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Administrator",
      nik: "admin",
      dept: "IT",
      role_id: adminRole.id,
      pass: hashedPass,
      status: "approved",
      ipAddress: "free",
      is_active: true,
    },
  });

  console.log("✅ Admin user created (nik: admin, pass: admin)");

  // ──────────────────────────────────────────────
  // 3. Menus
  // ──────────────────────────────────────────────

  // Parent menus
  const dashboardMenu = await prisma.menus.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Dashboard",
      icon: "20",
      path: "dashboard",
      parent_id: null,
      sort_order: 1,
      is_active: true,
    },
  });

  const userMgmtMenu = await prisma.menus.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: "User Management",
      icon: "1",
      path: null,
      parent_id: null,
      sort_order: 2,
      is_active: true,
    },
  });

  const masterDataMenu = await prisma.menus.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title: "Master Data",
      icon: "14",
      path: null,
      parent_id: null,
      sort_order: 3,
      is_active: true,
    },
  });

  const menuMgmtMenu = await prisma.menus.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: "Menu Management",
      icon: "15",
      path: "menu",
      parent_id: null,
      sort_order: 4,
      is_active: true,
    },
  });

  // Child menus under User Management
  const usersMenu = await prisma.menus.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      title: "Users",
      icon: "1",
      path: "user-management/users",
      parent_id: userMgmtMenu.id,
      sort_order: 1,
      is_active: true,
    },
  });

  const rolesMenu = await prisma.menus.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      title: "Roles",
      icon: "18",
      path: "user-management/roles",
      parent_id: userMgmtMenu.id,
      sort_order: 2,
      is_active: true,
    },
  });

  const logsMenu = await prisma.menus.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      title: "Activity Logs",
      icon: "5",
      path: "user-management/log-user",
      parent_id: userMgmtMenu.id,
      sort_order: 3,
      is_active: true,
    },
  });

  // Child menus under Master Data
  const exampleMenu = await prisma.menus.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      title: "Example",
      icon: "9",
      path: "master-data/example",
      parent_id: masterDataMenu.id,
      sort_order: 1,
      is_active: true,
    },
  });

  console.log("✅ Menus created");

  // ──────────────────────────────────────────────
  // 4. Menu Roles (assign all menus to ADMIN)
  // ──────────────────────────────────────────────
  const menuIds = [
    dashboardMenu.id,
    userMgmtMenu.id,
    masterDataMenu.id,
    menuMgmtMenu.id,
    usersMenu.id,
    rolesMenu.id,
    logsMenu.id,
    exampleMenu.id,
  ];

  for (const menuId of menuIds) {
    await prisma.menuRoles.upsert({
      where: { menu_id_role_id: { menu_id: menuId, role_id: adminRole.id } },
      update: {},
      create: { menu_id: menuId, role_id: adminRole.id },
    });
  }

  // Assign dashboard & example to USER role
  const userMenuIds = [dashboardMenu.id, exampleMenu.id];
  for (const menuId of userMenuIds) {
    await prisma.menuRoles.upsert({
      where: { menu_id_role_id: { menu_id: menuId, role_id: userRole.id } },
      update: {},
      create: { menu_id: menuId, role_id: userRole.id },
    });
  }

  console.log("✅ Menu roles assigned");

  // ──────────────────────────────────────────────
  // 5. Master Data Example
  // ──────────────────────────────────────────────
  await prisma.masterExample.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Sample Item",
      description: "This is a sample master data entry",
      value: "SAMPLE_001",
      is_active: true,
    },
  });

  console.log("✅ Master example data created");

  // ──────────────────────────────────────────────
  // 6. Reset PostgreSQL sequences so autoincrement
  //    works correctly after explicit-ID inserts
  // ──────────────────────────────────────────────
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), MAX(id)) FROM users;`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('roles', 'id'), MAX(id)) FROM roles;`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('menus', 'id'), MAX(id)) FROM menus;`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('master_example', 'id'), MAX(id)) FROM master_example;`
  );

  console.log("✅ Sequences reset");
  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
