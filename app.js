const ticketTypes = [
  "Pregunta General",
  "Status de Orden",
  "Status de Factura / NC",
  "Solicitud de Estado de Cuenta",
  "Productos Incorrecto / Faltante",
  "Productos Averiados",
  "Solicitud de devolucion",
  "Disputa de Balance CXC",
  "Error en Precio / Descuentos",
];

const automationFolders = [
  { label: "Servicio al Cliente / Pipeline", category: "Pipeline - Reglas Generales", count: 1 },
  { label: "Servicio al Cliente / Tipos de Caso", category: "Tipos de Caso - Pendiente", count: 0 },
  { label: "Servicio al Cliente / SLA y Escalaciones", category: "SLA y Escalaciones", count: 0 },
  { label: "Ventas", category: "Ventas", count: 0 },
  { label: "Finanzas", category: "Finanzas", count: 0 },
  { label: "Operaciones", category: "Operaciones", count: 0 },
  { label: "Recursos Humanos", category: "Recursos Humanos", count: 0 },
];

const pipelineStages = [
  "Nuevo Ticket",
  "En espera / Por Nosotros",
  "En Espera / Por Cliente",
  "Escalado / En Revision",
  "Pendiente por Almacen",
  "Pendiente por Contabilidad",
  "Cerrado",
];

const crmFields = [
  "Ticket #",
  "ID Cliente",
  "Contacto",
  "Numero",
  "Correo",
  "Vendedor",
  "Gestor",
  "Cobrador",
  "Tipo de ticket",
  "Etapa",
  "Prioridad",
  "Descripcion",
  "Documento Afectado",
  "Orden Afectada",
  "Factura Afectada",
  "Usuario Asignado",
  "SLA (Fecha estimada Cierre)",
  "Estatus",
  "Resolucion",
  "Fecha de apertura",
  "Fecha de escala (si aplica)",
  "Fecha de cierre",
];

const fieldValuePresets = {
  "Tipo de ticket": ticketTypes,
  Etapa: pipelineStages,
  Prioridad: ["Low", "Medium", "High"],
  Estatus: ["Open", "In Progress", "Closed", "Cancelled"],
  "Usuario Asignado": ["Group Supervisor", "Ticket Creator", "Almacen", "Contabilidad"],
};

const ruleOperators = [
  { value: "=", label: "Equals" },
  { value: "!=", label: "Does not equal" },
  { value: "changes to", label: "Changes to" },
  { value: "is empty", label: "Is empty" },
  { value: "is not empty", label: "Is not empty" },
];

const timeBasisPresets = [
  { value: "time in current stage", label: "Time in current stage" },
  { value: "time since ticket creation", label: "Time since ticket creation" },
  { value: "time since escalation", label: "Time since escalation" },
  { value: "time since last update", label: "Time since last update" },
];

const slaPresets = ["Immediate", "24 hours", "48 hours", "72 hours"];

const actionTypes = [
  { key: "trigger", label: "Trigger / Disparador", nodeType: "trigger" },
  { key: "condition", label: "Condition / Condicion", nodeType: "condition" },
  { key: "assign_owner", label: "Assign Owner / Asignar", nodeType: "action" },
  { key: "move_stage", label: "Move Stage / Mover Etapa", nodeType: "status" },
  { key: "create_task", label: "Create Task / Crear Tarea", nodeType: "task" },
  { key: "notify", label: "Notify / Notificar", nodeType: "notify" },
  { key: "wait", label: "Wait / Esperar", nodeType: "action" },
  { key: "update_field", label: "Update Field / Actualizar", nodeType: "action" },
  { key: "webhook", label: "Webhook / API", nodeType: "action" },
  { key: "close_ticket", label: "Close Ticket / Cerrar", nodeType: "status" },
];

const storageKey = "dgl-automation-planner-v3";

const seedWorkflow = {
  id: "wf-cs-pipeline-general-rules",
  folder: "Servicio al Cliente",
  category: "Pipeline - Reglas Generales",
  title: "CS Pipeline - Reglas Generales",
  owner: "Servicio al Cliente",
  status: "Draft",
  objective:
    "Aplicar reglas generales a todos los tickets creados o movidos dentro del pipeline de Servicio al Cliente.",
  nodes: [
    {
      id: "N1",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "Ticket creado en pipeline CS",
      backendName: "cs_pipeline_ticket_created",
      summary: "Aplica a todo ticket nuevo creado bajo el pipeline de Servicio al Cliente.",
      criteria: "Pipeline = Servicio al Cliente AND Etapa = Nuevo Ticket",
      fieldsUpdated: "Fecha de apertura, Estatus, Prioridad",
      ownerRule: "N/A",
      sla: "Immediate",
      notification: "N/A",
      developerNotes: "Debe dispararse una sola vez por ticket creado dentro del pipeline CS.",
      x: 60,
      y: 70,
    },
    {
      id: "N2",
      type: "action",
      actionKey: "update_field",
      labelEs: "Asignar prioridad baja",
      backendName: "set_default_low_priority",
      summary: "Todo ticket CS debe iniciar con prioridad baja por defecto.",
      criteria: "Prioridad is empty OR ticket is newly created",
      fieldsUpdated: "Prioridad = Low",
      ownerRule: "System",
      sla: "Immediate",
      notification: "N/A",
      developerNotes: "Esta regla corre antes de las excepciones por tipo de ticket.",
      x: 60,
      y: 210,
    },
    {
      id: "N3",
      type: "condition",
      actionKey: "condition",
      labelEs: "Evaluar prioridad por tipo",
      backendName: "evaluate_priority_by_ticket_type",
      summary: "Aplica excepciones de prioridad segun Tipo de ticket.",
      criteria:
        "Tipo de ticket = Solicitud de devolucion OR Status de Factura / NC OR Error en Precio / Descuentos OR Productos Incorrecto / Faltante OR Productos Averiados",
      fieldsUpdated: "Prioridad",
      ownerRule: "System",
      sla: "Immediate after default priority",
      notification: "N/A",
      developerNotes: "Implementar como tabla de decision usando IDs internos del campo Type si DGL los provee.",
      x: 60,
      y: 350,
    },
    {
      id: "N4",
      type: "action",
      actionKey: "update_field",
      labelEs: "Prioridad media: devolucion",
      backendName: "set_medium_priority_return_request",
      summary: "Solicitud de devolucion debe subir de baja a prioridad media.",
      criteria: "Tipo de ticket = Solicitud de devolucion",
      fieldsUpdated: "Prioridad = Medium",
      ownerRule: "System",
      sla: "Immediate",
      notification: "N/A",
      developerNotes: "Esta regla reemplaza la prioridad baja asignada por defecto.",
      x: 60,
      y: 520,
    },
    {
      id: "N5",
      type: "action",
      actionKey: "update_field",
      labelEs: "Prioridad alta: factura, precio o producto",
      backendName: "set_high_priority_invoice_pricing_product",
      summary: "Casos de factura/NC, errores de precio/descuento o errores de producto deben ser alta prioridad.",
      criteria:
        "Tipo de ticket = Status de Factura / NC OR Error en Precio / Descuentos OR Productos Incorrecto / Faltante OR Productos Averiados",
      fieldsUpdated: "Prioridad = High",
      ownerRule: "System",
      sla: "Immediate",
      notification: "N/A",
      developerNotes: "Confirmar si 'product errors' incluye ambos: Productos Incorrecto / Faltante y Productos Averiados.",
      x: 310,
      y: 525,
    },
    {
      id: "N6",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "Etapa: Pendiente por Almacen",
      backendName: "stage_changed_to_pending_warehouse",
      summary: "Cuando cualquier ticket CS se mueve a Pendiente por Almacen.",
      criteria: "Pipeline = Servicio al Cliente AND Etapa changes to Pendiente por Almacen",
      fieldsUpdated: "Notification log",
      ownerRule: "Almacen user group",
      sla: "Immediate",
      notification: "Notify Almacen user group",
      developerNotes: "Usar el grupo de usuarios exacto 'Almacen' configurado en DGL.",
      x: 430,
      y: 70,
    },
    {
      id: "N7",
      type: "notify",
      actionKey: "notify",
      labelEs: "Notificar grupo Almacen",
      backendName: "notify_warehouse_group",
      summary: "Enviar notificacion al grupo Almacen cuando el ticket entra a su etapa.",
      criteria: "Etapa = Pendiente por Almacen",
      fieldsUpdated: "Notification log",
      ownerRule: "Recipient group = Almacen",
      sla: "Immediate",
      notification: "In-app and/or email to Almacen group",
      developerNotes: "Mensaje debe incluir Ticket #, Tipo de ticket, Prioridad y Usuario Asignado.",
      x: 430,
      y: 210,
    },
    {
      id: "N8",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "Etapa: Pendiente por Contabilidad",
      backendName: "stage_changed_to_pending_accounting",
      summary: "Cuando cualquier ticket CS se mueve a Pendiente por Contabilidad.",
      criteria: "Pipeline = Servicio al Cliente AND Etapa changes to Pendiente por Contabilidad",
      fieldsUpdated: "Notification log",
      ownerRule: "Contabilidad user group",
      sla: "Immediate",
      notification: "Notify Contabilidad user group",
      developerNotes: "Usar el grupo de usuarios exacto de Contabilidad configurado en DGL.",
      x: 730,
      y: 70,
    },
    {
      id: "N9",
      type: "notify",
      actionKey: "notify",
      labelEs: "Notificar grupo Contabilidad",
      backendName: "notify_accounting_group",
      summary: "Enviar notificacion al grupo Contabilidad cuando el ticket entra a su etapa.",
      criteria: "Etapa = Pendiente por Contabilidad",
      fieldsUpdated: "Notification log",
      ownerRule: "Recipient group = Contabilidad",
      sla: "Immediate",
      notification: "In-app and/or email to Contabilidad group",
      developerNotes: "Mensaje debe incluir Ticket #, Tipo de ticket, Prioridad y Usuario Asignado.",
      x: 730,
      y: 210,
    },
    {
      id: "N10",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "En espera / Por Nosotros > 24h",
      backendName: "waiting_on_us_over_24h",
      summary: "Detecta tickets que llevan mas de 24 horas esperando accion interna.",
      criteria: "Etapa = En espera / Por Nosotros AND time in stage > 24 hours",
      fieldsUpdated: "Related task",
      ownerRule: "Group Supervisor role",
      sla: "After 24 hrs in stage",
      notification: "Task assignment to group supervisor",
      developerNotes: "Evitar crear tareas duplicadas si el ticket permanece en la etapa varios dias.",
      x: 430,
      y: 390,
    },
    {
      id: "N11",
      type: "task",
      actionKey: "create_task",
      labelEs: "Tarea supervisor: dar seguimiento",
      backendName: "create_supervisor_followup_waiting_on_us",
      summary: "Crear tarea para que el supervisor contacte al assignee y revise el ticket.",
      criteria: "waiting_on_us_over_24h fired and no open duplicate supervisor task exists",
      fieldsUpdated: "Task assigned to Group Supervisor; description = Ticket #",
      ownerRule: "Assignee = predefined DGL Group Supervisor role",
      sla: "Due immediately or same business day",
      notification: "Notify Group Supervisor",
      developerNotes: "Descripcion/comentario de tarea debe contener el Ticket # que sigue esperando por nosotros.",
      x: 430,
      y: 540,
    },
    {
      id: "N12",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "En Espera / Por Cliente > 24h",
      backendName: "waiting_on_client_over_24h",
      summary: "Detecta tickets que llevan mas de 24 horas esperando respuesta del cliente.",
      criteria: "Etapa = En Espera / Por Cliente AND time in stage > 24 hours",
      fieldsUpdated: "Related task",
      ownerRule: "Ticket creator",
      sla: "After 24 hrs in stage",
      notification: "Task assignment to ticket creator",
      developerNotes: "Confirmar si creador del ticket es el campo created_by o el usuario que lo registro manualmente.",
      x: 730,
      y: 390,
    },
    {
      id: "N13",
      type: "task",
      actionKey: "create_task",
      labelEs: "Tarea creador: llamar o enviar email",
      backendName: "create_customer_followup_task_for_creator",
      summary: "Crear tarea para llamada o email de seguimiento al cliente.",
      criteria: "waiting_on_client_over_24h fired and no open duplicate customer follow-up task exists",
      fieldsUpdated: "Task assigned to ticket creator; description = Ticket # and customer follow-up request",
      ownerRule: "Assignee = ticket creator",
      sla: "Due immediately or same business day",
      notification: "Notify ticket creator",
      developerNotes: "La tarea debe indicar que el cliente necesita llamada o email de seguimiento.",
      x: 730,
      y: 540,
    },
    {
      id: "N14",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "Etapa: Escalado / En Revision",
      backendName: "stage_changed_to_escalated_review",
      summary: "Cuando un ticket se coloca en la etapa Escalado / En Revision.",
      criteria: "Pipeline = Servicio al Cliente AND Etapa changes to Escalado / En Revision",
      fieldsUpdated: "Related task, Fecha de escala (si aplica)",
      ownerRule: "Group Supervisor role",
      sla: "48 hrs",
      notification: "Task assignment to group supervisor",
      developerNotes: "Registrar Fecha de escala si el campo esta vacio.",
      x: 1030,
      y: 390,
    },
    {
      id: "N15",
      type: "task",
      actionKey: "create_task",
      labelEs: "Tarea supervisor: actualizar en 48h",
      backendName: "create_supervisor_escalation_review_task",
      summary: "Crear tarea para que el supervisor revise el ticket escalado y provea update.",
      criteria: "Ticket enters Escalado / En Revision",
      fieldsUpdated: "Task assigned to Group Supervisor; due date = +48 hours",
      ownerRule: "Assignee = predefined DGL Group Supervisor role",
      sla: "Due within 48 hours",
      notification: "Notify Group Supervisor",
      developerNotes: "La tarea debe pedir revisar el ticket y proveer una actualizacion dentro de 48 horas.",
      x: 1030,
      y: 540,
    },
  ],
  edges: [
    { from: "N1", to: "N2", label: "" },
    { from: "N2", to: "N3", label: "" },
    { from: "N3", to: "N4", label: "Devolucion" },
    { from: "N3", to: "N5", label: "Alta prioridad" },
    { from: "N6", to: "N7", label: "Notify" },
    { from: "N8", to: "N9", label: "Notify" },
    { from: "N10", to: "N11", label: "24h" },
    { from: "N12", to: "N13", label: "24h" },
    { from: "N14", to: "N15", label: "48h" },
  ],
};

let appState = loadState();
let state = currentWorkflow();
let selectedNodeId = state?.nodes[0]?.id || null;
let zoom = 0.92;
let drag = null;
let keepSelectedNodeVisibleAfterRender = false;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? normalizeAppState(JSON.parse(saved)) : createInitialAppState();
  } catch (error) {
    console.warn("Could not load saved workflow.", error);
    return createInitialAppState();
  }
}

function saveState() {
  if (state && !appState.workflows.some((workflow) => workflow.id === state.id)) {
    appState.workflows.push(state);
  }
  if (state) state.updatedAt = new Date().toISOString();
  appState.activeWorkflowId = state?.id || null;
  appState.activeCategory = state?.category || appState.activeCategory;
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function selectedNode() {
  return state?.nodes.find((node) => node.id === selectedNodeId) || null;
}

function createInitialAppState() {
  const workflow = clone(seedWorkflow);
  workflow.saved = true;
  workflow.savedAt = new Date().toISOString();
  return {
    activeCategory: workflow.category,
    activeWorkflowId: workflow.id,
    inspectorCollapsed: false,
    workflows: [workflow],
  };
}

function normalizeAppState(value) {
  if (value?.workflows) {
    const normalized = {
      activeCategory: value.activeCategory || value.workflows[0]?.category || seedWorkflow.category,
      activeWorkflowId: value.activeWorkflowId || value.workflows[0]?.id || null,
      inspectorCollapsed: Boolean(value.inspectorCollapsed),
      workflows: value.workflows,
    };
    if (!normalized.workflows.some((workflow) => workflow.id === normalized.activeWorkflowId)) {
      normalized.activeWorkflowId = normalized.workflows[0]?.id || null;
    }
    if (!normalized.workflows.length) {
      const initial = createInitialAppState();
      return initial;
    }
    return normalized;
  }
  const workflow = value?.nodes ? value : clone(seedWorkflow);
  workflow.saved = workflow.saved !== false;
  workflow.savedAt = workflow.savedAt || new Date().toISOString();
  return {
    activeCategory: workflow.category,
    activeWorkflowId: workflow.id,
    inspectorCollapsed: false,
    workflows: [workflow],
  };
}

function currentWorkflow() {
  return appState.workflows.find((workflow) => workflow.id === appState.activeWorkflowId) || null;
}

function folderCount(category) {
  return appState.workflows.filter((workflow) => workflow.category === category && workflow.saved !== false).length;
}

function workflowForCategory(category) {
  const workflows = appState.workflows.filter((workflow) => workflow.category === category);
  const savedWorkflows = workflows.filter((workflow) => workflow.saved !== false);
  return savedWorkflows[savedWorkflows.length - 1] || workflows[workflows.length - 1] || null;
}

function activeFolderLabel() {
  return automationFolders.find((folder) => folder.category === appState.activeCategory)?.label || appState.activeCategory;
}

function createBlankWorkflow(category) {
  return {
    id: `wf-${Date.now()}`,
    folder: category.startsWith("Pipeline") || category.includes("Caso") || category.includes("SLA") ? "Servicio al Cliente" : category,
    category,
    title: `Nueva automatizacion - ${category}`,
    owner: "Servicio al Cliente",
    status: "Unsaved",
    saved: false,
    objective: "Describe the automation goal before sending to developers.",
    nodes: [],
    edges: [],
    updatedAt: new Date().toISOString(),
  };
}

function render() {
  const app = document.querySelector("#app");
  state = currentWorkflow();
  app.innerHTML = `
    <div class="app-shell ${appState.inspectorCollapsed ? "inspector-is-collapsed" : ""}">
      ${renderSidebar()}
    <main class="workspace">
      ${renderTopbar()}
      ${renderTools()}
      ${renderCanvas()}
      ${renderPrintSheet()}
    </main>
    ${renderInspector()}
    </div>
  `;
  bindEvents();
  drawConnectors();
  if (keepSelectedNodeVisibleAfterRender) {
    keepSelectedNodeVisibleAfterRender = false;
    requestAnimationFrame(keepSelectedNodeVisible);
  }
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">DGL</div>
        <div>
          <h1>Automation Planner</h1>
          <p>CRM workflow specs</p>
        </div>
      </div>
      <button class="primary-button" data-action="new-workflow">+ New automation</button>

      <section class="sidebar-section">
        <h2 class="section-title">Automation Folders</h2>
        <div class="folder-list">
          ${automationFolders
            .map(
              (folder) => `
                <button class="folder-button ${appState.activeCategory === folder.category ? "active" : ""}" data-category="${escapeHtml(folder.category)}">
                  <span>${escapeHtml(folder.label)}</span>
                  <span class="folder-count">${folderCount(folder.category)}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="sidebar-section">
        <h2 class="section-title">CS Ticket Types</h2>
        <div class="field-list">
          ${ticketTypes.map((type) => `<span class="field-chip">${escapeHtml(type)}</span>`).join("")}
        </div>
      </section>

      <section class="sidebar-section">
        <h2 class="section-title">Preset Actions</h2>
        <div class="palette-list">
          ${actionTypes
            .map(
              (action) => `
                <button class="palette-button" data-add-action="${action.key}">
                  <span class="dot ${action.nodeType}"></span>
                  <span>${escapeHtml(action.label)}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="sidebar-section">
        <h2 class="section-title">DGL Ticket Fields</h2>
        <div class="field-list">
          ${crmFields.map((field) => `<span class="field-chip">${escapeHtml(field)}</span>`).join("")}
        </div>
      </section>
    </aside>
  `;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div>
        <input class="title-input" value="${escapeAttr(state.title)}" aria-label="Automation title" data-workflow-field="title" />
        <div class="subtitle-row">
          <span>${escapeHtml(state.folder)}</span>
          <span>/</span>
          <span>${escapeHtml(state.category)}</span>
          <span class="status-pill">${escapeHtml(state.status)}</span>
          <span class="status-pill">${state.saved ? "Saved in folder" : "Not saved to folder yet"}</span>
          <span class="lang-toggle">ES client view + EN backend spec</span>
        </div>
      </div>
      <div class="top-actions">
        <button class="primary-action-button" data-action="save-automation">Save automation</button>
        <button class="warning-button" data-action="restore-template">Restore starter template</button>
        <button class="secondary-button" data-action="copy-spec">Copy spec</button>
        <button class="secondary-button" data-action="import-json">Import JSON</button>
        <button class="secondary-button" data-action="export-json">Export JSON</button>
        <button class="secondary-button" data-action="print-pdf">Print / PDF</button>
        <input class="visually-hidden" type="file" accept="application/json,.json" data-import-json-input />
      </div>
    </header>
  `;
}

function renderTools() {
  return `
    <div class="flow-tools">
      <button class="secondary-button" data-action="add-branch">+ Branch</button>
      <div class="stage-strip" aria-label="Pipeline stages">
        ${pipelineStages.map((stage) => `<div class="stage">${escapeHtml(stage)}</div>`).join("")}
      </div>
      <div class="zoom-controls">
        <button class="ghost-button" data-action="zoom-out">-</button>
        <span class="status-pill">${Math.round(zoom * 100)}%</span>
        <button class="ghost-button" data-action="zoom-in">+</button>
        <button class="ghost-button" data-action="reset-zoom">Reset</button>
      </div>
    </div>
  `;
}

function renderCanvas() {
  if (!state.nodes.length) {
    return `
      <section class="canvas-shell" aria-label="Automation diagram canvas">
        <div class="empty-canvas">
          <h2>${escapeHtml(activeFolderLabel())}</h2>
          <p>No saved automations in this folder yet. Click <strong>+ New automation</strong> to start a draft, then use <strong>Save automation</strong> to store it in this category.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="canvas-shell" aria-label="Automation diagram canvas">
      <div class="canvas" style="transform: scale(${zoom});">
        <svg class="connector-layer" width="1320" height="900" aria-hidden="true">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#8ba1bd"></path>
            </marker>
          </defs>
        </svg>
        ${state.nodes.map(renderNode).join("")}
      </div>
    </section>
  `;
}

function renderNode(node) {
  return `
    <article class="node ${node.id === selectedNodeId ? "selected" : ""}" data-node-id="${node.id}" style="left:${node.x}px; top:${node.y}px;">
      <div class="node-header">
        <span class="node-type ${node.type}">
          <span class="dot ${node.type}"></span>
          ${escapeHtml(typeLabel(node))}
        </span>
        <span class="node-id">${escapeHtml(node.id)}</span>
      </div>
      <div class="node-body">
        <h3 class="node-title">${escapeHtml(node.labelEs)}</h3>
        <p class="node-backend">${escapeHtml(node.backendName)}</p>
        <div class="node-note">${escapeHtml(node.summary)}</div>
      </div>
    </article>
  `;
}

function renderInspector() {
  if (appState.inspectorCollapsed) {
    return `
      <aside class="inspector collapsed-inspector">
        <button class="icon-button" data-action="toggle-inspector" title="Expand step spec">Spec</button>
      </aside>
    `;
  }

  const node = selectedNode();
  if (!node) {
    return `
      <aside class="inspector">
        <div class="inspector-header">
          <div>
            <h2>Step spec</h2>
            <p>${state.nodes.length ? "Select a step to edit the implementation spec." : "This folder has no automation selected yet."}</p>
          </div>
          <button class="ghost-button" data-action="toggle-inspector">Collapse</button>
        </div>
        <div class="empty-state">
          ${state.nodes.length ? "Select a step to edit the implementation spec." : "Create or save an automation in this folder to edit step details."}
        </div>
      </aside>
    `;
  }

  return `
    <aside class="inspector">
      <div class="inspector-header">
        <div>
          <h2>Step spec</h2>
          <p>Edit the Spanish client label and the English/backend implementation details for developers.</p>
        </div>
        <div class="inspector-actions">
          <button class="ghost-button" data-action="toggle-inspector">Collapse</button>
          <button class="danger-button" data-action="delete-node">Delete</button>
        </div>
      </div>

      <div class="form-grid">
        ${fieldInput("Spanish label", "labelEs", node.labelEs)}
        ${fieldInput("English/backend name", "backendName", node.backendName)}
        ${selectInput("Action type", "actionKey", node.actionKey)}
        ${fieldTextarea("Client summary", "summary", node.summary)}
        ${renderRuleBuilder(node)}
        ${fieldTextarea("Criteria / rules", "criteria", node.criteria)}
        ${fieldTextarea("Fields updated", "fieldsUpdated", node.fieldsUpdated)}
        ${fieldTextarea("Owner / assignment rule", "ownerRule", node.ownerRule)}
        ${renderSlaPreset(node)}
        ${fieldInput("Delay / SLA", "sla", node.sla)}
        ${fieldTextarea("Notification", "notification", node.notification)}
        ${fieldTextarea("Developer notes", "developerNotes", node.developerNotes)}
      </div>

      <div class="spec-card">
        <h3>Developer handoff preview</h3>
        <dl class="spec-list">
          ${specRow("Trigger/Action", typeLabel(node))}
          ${specRow("Backend", node.backendName)}
          ${specRow("Criteria", node.criteria)}
          ${specRow("Updates", node.fieldsUpdated)}
          ${specRow("SLA", node.sla)}
        </dl>
      </div>
    </aside>
  `;
}

function renderPrintSheet() {
  return `
    <section class="print-sheet">
      <h1>${escapeHtml(state.title)}</h1>
      <p class="print-meta">${escapeHtml(state.folder)} / ${escapeHtml(state.category)} | Status: ${escapeHtml(state.status)}</p>
      <div class="print-grid">
        <div class="print-box">
          <h2>Automation Flow</h2>
          <ol class="print-list">
            ${state.nodes
              .map(
                (node) => `
                  <li>
                    <strong>${escapeHtml(node.labelEs)}</strong> (${escapeHtml(node.backendName)}): ${escapeHtml(node.summary)}
                  </li>
                `,
              )
              .join("")}
          </ol>
        </div>
        <div class="print-box">
          <h2>Developer Specs</h2>
          <ol class="print-list">
            ${state.nodes
              .map(
                (node) => `
                  <li>
                    <strong>${escapeHtml(node.id)} ${escapeHtml(node.backendName)}</strong><br />
                    Criteria: ${escapeHtml(node.criteria)}<br />
                    Updates: ${escapeHtml(node.fieldsUpdated)}<br />
                    Owner: ${escapeHtml(node.ownerRule)}<br />
                    SLA: ${escapeHtml(node.sla)}<br />
                    Notes: ${escapeHtml(node.developerNotes)}
                  </li>
                `,
              )
              .join("")}
          </ol>
        </div>
      </div>
    </section>
  `;
}

function fieldInput(label, key, value) {
  return `
    <div class="field">
      <label>${escapeHtml(label)}</label>
      <input value="${escapeAttr(value)}" data-node-field="${key}" />
    </div>
  `;
}

function fieldTextarea(label, key, value) {
  return `
    <div class="field">
      <label>${escapeHtml(label)}</label>
      <textarea data-node-field="${key}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function selectInput(label, key, value) {
  return `
    <div class="field">
      <label>${escapeHtml(label)}</label>
      <select data-node-field="${key}">
        ${actionTypes
          .map((action) => `<option value="${action.key}" ${action.key === value ? "selected" : ""}>${escapeHtml(action.label)}</option>`)
          .join("")}
      </select>
    </div>
  `;
}

function renderRuleBuilder(node) {
  const builder = getRuleBuilder(node);
  const valueOptions = fieldValuePresets[builder.field] || [];
  const isTimeRule = builder.mode === "time";
  return `
    <div class="rule-builder">
      <div class="rule-builder-header">
        <div>
          <h3>Guided rule builder</h3>
          <p>Use presets to generate cleaner criteria and reduce typing errors.</p>
        </div>
        <button class="secondary-button" data-action="apply-rule-builder">Apply rule</button>
      </div>

      <div class="segmented-control" role="group" aria-label="Rule type">
        <button class="${builder.mode === "field" ? "active" : ""}" data-rule-mode="field">Field rule</button>
        <button class="${builder.mode === "time" ? "active" : ""}" data-rule-mode="time">Time elapsed</button>
      </div>

      <div class="rule-grid ${isTimeRule ? "is-hidden" : ""}">
        ${miniSelect("IF field", "field", builder.field, crmFields)}
        ${miniSelect("Operator", "operator", builder.operator, ruleOperators)}
        ${valueOptions.length ? miniSelect("Value", "value", builder.value, valueOptions) : miniInput("Value", "value", builder.value)}
      </div>

      <div class="rule-grid ${isTimeRule ? "" : "is-hidden"}">
        ${miniSelect("IF time", "timeBasis", builder.timeBasis, timeBasisPresets)}
        ${miniSelect("Elapsed", "elapsed", builder.elapsed, slaPresets.filter((preset) => preset !== "Immediate"))}
        ${miniSelect("Stage", "stage", builder.stage, pipelineStages)}
        ${miniSelect("Closure guard", "guard", builder.guard, ["not closed", "any status"])}
      </div>

      <div class="preset-row">
        <button class="ghost-chip" data-rule-template="stage-escalated">Stage = Escalado</button>
        <button class="ghost-chip" data-rule-template="type-return">Type = Devolucion</button>
        <button class="ghost-chip" data-rule-template="time-24-client">Client wait > 24h</button>
        <button class="ghost-chip" data-rule-template="time-48-escalated">Escalated > 48h</button>
      </div>
    </div>
  `;
}

function renderSlaPreset(node) {
  return `
    <div class="field">
      <label>SLA / delay preset</label>
      <select data-sla-preset>
        <option value="">Choose preset...</option>
        ${slaPresets.map((preset) => `<option value="${escapeAttr(preset)}" ${node.sla === preset ? "selected" : ""}>${escapeHtml(preset)}</option>`).join("")}
      </select>
    </div>
  `;
}

function miniSelect(label, key, value, options) {
  return `
    <div class="mini-field">
      <label>${escapeHtml(label)}</label>
      <select data-rule-field="${key}">
        ${options
          .map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
          })
          .join("")}
      </select>
    </div>
  `;
}

function miniInput(label, key, value) {
  return `
    <div class="mini-field">
      <label>${escapeHtml(label)}</label>
      <input value="${escapeAttr(value)}" data-rule-field="${key}" />
    </div>
  `;
}

function specRow(label, value) {
  return `
    <div class="spec-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "Not set")}</span>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectCategory(button.dataset.category);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-add-action]").forEach((button) => {
    button.addEventListener("click", () => addAction(button.dataset.addAction));
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });

  document.querySelectorAll("[data-import-json-input]").forEach((input) => {
    input.addEventListener("change", () => importJsonFile(input));
  });

  document.querySelectorAll("[data-rule-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const node = selectedNode();
      if (!node) return;
      node.ruleBuilder = { ...getRuleBuilder(node), mode: button.dataset.ruleMode };
      markUnsaved();
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-rule-field]").forEach((field) => {
    field.addEventListener("input", () => {
      const node = selectedNode();
      if (!node) return;
      node.ruleBuilder = { ...getRuleBuilder(node), [field.dataset.ruleField]: field.value };
      markUnsaved();
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-rule-template]").forEach((button) => {
    button.addEventListener("click", () => applyRuleTemplate(button.dataset.ruleTemplate));
  });

  document.querySelectorAll("[data-sla-preset]").forEach((field) => {
    field.addEventListener("change", () => {
      const node = selectedNode();
      if (!node || !field.value) return;
      node.sla = field.value;
      markUnsaved();
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-workflow-field]").forEach((field) => {
    field.addEventListener("input", () => {
      state[field.dataset.workflowField] = field.value;
      markUnsaved();
      saveState();
      updatePrintOnly();
    });
  });

  document.querySelectorAll("[data-node-field]").forEach((field) => {
    field.addEventListener("input", () => {
      const node = selectedNode();
      if (!node) return;
      node[field.dataset.nodeField] = field.value;
      if (field.dataset.nodeField === "actionKey") {
        const action = actionTypes.find((item) => item.key === field.value);
        node.type = action?.nodeType || "action";
        markUnsaved();
        saveState();
        render();
        return;
      }
      markUnsaved();
      saveState();
      refreshSelectedNodeCard(node);
      updatePrintOnly();
    });
  });

  document.querySelectorAll(".node").forEach((nodeEl) => {
    nodeEl.addEventListener("pointerdown", startDrag);
    nodeEl.addEventListener("click", () => {
      selectedNodeId = nodeEl.dataset.nodeId;
      render();
    });
  });

  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", stopDrag);
}

function handleAction(action) {
  if (action === "new-workflow") newWorkflow();
  if (action === "save-automation") saveAutomation();
  if (action === "toggle-inspector") toggleInspector();
  if (action === "apply-rule-builder") applyRuleBuilder();
  if (action === "restore-template") restoreTemplate();
  if (action === "add-branch") addBranch();
  if (action === "delete-node") deleteNode();
  if (action === "import-json") document.querySelector("[data-import-json-input]")?.click();
  if (action === "export-json") exportJson();
  if (action === "print-pdf") window.print();
  if (action === "copy-spec") copySpec();
  if (action === "zoom-in") setZoom(zoom + 0.08);
  if (action === "zoom-out") setZoom(zoom - 0.08);
  if (action === "reset-zoom") setZoom(0.92);
}

function selectCategory(category) {
  appState.activeCategory = category;
  let workflow = workflowForCategory(category);
  if (!workflow) {
    workflow = createBlankWorkflow(category);
    appState.workflows.push(workflow);
  }
  appState.activeWorkflowId = workflow.id;
  state = workflow;
  selectedNodeId = workflow.nodes[0]?.id || null;
}

function markUnsaved() {
  if (!state) return;
  state.saved = false;
  state.status = "Unsaved";
}

function saveAutomation() {
  if (!state) return;
  if (!state.title.trim()) state.title = `Nueva automatizacion - ${state.category}`;
  state.saved = true;
  state.status = "Saved";
  state.savedAt = new Date().toISOString();
  saveState();
  render();
}

function toggleInspector() {
  appState.inspectorCollapsed = !appState.inspectorCollapsed;
  keepSelectedNodeVisibleAfterRender = true;
  saveState();
  render();
}

function getRuleBuilder(node) {
  return {
    mode: node.ruleBuilder?.mode || "field",
    field: node.ruleBuilder?.field || "Etapa",
    operator: node.ruleBuilder?.operator || "changes to",
    value: node.ruleBuilder?.value || "Escalado / En Revision",
    timeBasis: node.ruleBuilder?.timeBasis || "time in current stage",
    elapsed: node.ruleBuilder?.elapsed || "24 hours",
    stage: node.ruleBuilder?.stage || "Escalado / En Revision",
    guard: node.ruleBuilder?.guard || "not closed",
  };
}

function applyRuleBuilder() {
  const node = selectedNode();
  if (!node) return;
  node.ruleBuilder = getRuleBuilder(node);
  node.criteria = buildCriteriaFromRule(node.ruleBuilder);
  if (node.ruleBuilder.mode === "time") {
    node.sla = `After ${node.ruleBuilder.elapsed}`;
  }
  markUnsaved();
  saveState();
  render();
}

function buildCriteriaFromRule(builder) {
  if (builder.mode === "time") {
    const guardText = builder.guard === "not closed" ? " AND Etapa != Cerrado" : "";
    return `${builder.timeBasis} >= ${builder.elapsed} AND Etapa = ${builder.stage}${guardText}`;
  }

  if (builder.operator === "is empty" || builder.operator === "is not empty") {
    return `${builder.field} ${builder.operator}`;
  }

  return `${builder.field} ${builder.operator} ${builder.value}`;
}

function applyRuleTemplate(template) {
  const node = selectedNode();
  if (!node) return;

  const templates = {
    "stage-escalated": {
      mode: "field",
      field: "Etapa",
      operator: "changes to",
      value: "Escalado / En Revision",
    },
    "type-return": {
      mode: "field",
      field: "Tipo de ticket",
      operator: "=",
      value: "Solicitud de devolucion",
    },
    "time-24-client": {
      mode: "time",
      timeBasis: "time in current stage",
      elapsed: "24 hours",
      stage: "En Espera / Por Cliente",
      guard: "not closed",
    },
    "time-48-escalated": {
      mode: "time",
      timeBasis: "time since escalation",
      elapsed: "48 hours",
      stage: "Escalado / En Revision",
      guard: "not closed",
    },
  };

  node.ruleBuilder = { ...getRuleBuilder(node), ...templates[template] };
  node.criteria = buildCriteriaFromRule(node.ruleBuilder);
  if (node.ruleBuilder.mode === "time") node.sla = `After ${node.ruleBuilder.elapsed}`;
  markUnsaved();
  saveState();
  render();
}

function keepSelectedNodeVisible() {
  const node = selectedNode();
  const shell = document.querySelector(".canvas-shell");
  if (!node || !shell || !state?.nodes.length) return;

  const nodeWidth = 220 * zoom;
  const nodeHeight = 110 * zoom;
  const nodeLeft = node.x * zoom;
  const nodeTop = node.y * zoom;
  const nodeRight = nodeLeft + nodeWidth;
  const nodeBottom = nodeTop + nodeHeight;
  const visibleLeft = shell.scrollLeft;
  const visibleTop = shell.scrollTop;
  const visibleRight = visibleLeft + shell.clientWidth;
  const visibleBottom = visibleTop + shell.clientHeight;

  const isFullyVisible =
    nodeLeft >= visibleLeft + 24 &&
    nodeRight <= visibleRight - 24 &&
    nodeTop >= visibleTop + 24 &&
    nodeBottom <= visibleBottom - 24;

  if (isFullyVisible) return;

  shell.scrollTo({
    left: Math.max(0, nodeLeft - (shell.clientWidth - nodeWidth) / 2),
    top: Math.max(0, nodeTop - (shell.clientHeight - nodeHeight) / 2),
    behavior: "smooth",
  });
}

function startDrag(event) {
  const nodeId = event.currentTarget.dataset.nodeId;
  selectedNodeId = nodeId;
  const node = state.nodes.find((item) => item.id === nodeId);
  drag = {
    nodeId,
    startX: event.clientX,
    startY: event.clientY,
    initialX: node.x,
    initialY: node.y,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!drag) return;
  const node = state.nodes.find((item) => item.id === drag.nodeId);
  node.x = Math.max(20, drag.initialX + (event.clientX - drag.startX) / zoom);
  node.y = Math.max(20, drag.initialY + (event.clientY - drag.startY) / zoom);
  const nodeEl = document.querySelector(`[data-node-id="${drag.nodeId}"]`);
  if (nodeEl) {
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;
  }
  drawConnectors();
}

function stopDrag() {
  if (!drag) return;
  drag = null;
  markUnsaved();
  saveState();
}

function drawConnectors() {
  const svg = document.querySelector(".connector-layer");
  if (!svg) return;
  svg.querySelectorAll(".connector-path, .connector-label").forEach((item) => item.remove());

  state.edges.forEach((edge) => {
    const from = state.nodes.find((node) => node.id === edge.from);
    const to = state.nodes.find((node) => node.id === edge.to);
    if (!from || !to) return;
    const start = { x: from.x + 110, y: from.y + 92 };
    const end = { x: to.x + 110, y: to.y };
    const midY = start.y + Math.max(36, (end.y - start.y) / 2);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "connector-path");
    path.setAttribute("marker-end", "url(#arrow)");
    path.setAttribute("d", `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y - 8}`);
    svg.appendChild(path);

    if (edge.label) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "connector-label");
      label.setAttribute("x", (start.x + end.x) / 2);
      label.setAttribute("y", midY - 8);
      label.setAttribute("text-anchor", "middle");
      label.textContent = edge.label;
      svg.appendChild(label);
    }
  });
}

function addAction(actionKey) {
  const action = actionTypes.find((item) => item.key === actionKey) || actionTypes[2];
  const source = selectedNode() || state.nodes[state.nodes.length - 1];
  const id = nextNodeId();
  const node = {
    id,
    type: action.nodeType,
    actionKey,
    labelEs: spanishDefault(actionKey),
    backendName: backendDefault(actionKey),
    summary: "Describe what this step should do for the client and developers.",
    criteria: "Define when this step runs.",
    fieldsUpdated: "List CRM fields changed by this step.",
    ownerRule: "Define owner, team, queue, or fallback.",
    sla: "Immediate",
    notification: "None",
    developerNotes: "Add implementation notes, exceptions, and required IDs.",
    x: source ? source.x : 520,
    y: source ? source.y + 145 : 120,
  };
  state.nodes.push(node);
  if (source) state.edges.push({ from: source.id, to: id, label: "" });
  selectedNodeId = id;
  markUnsaved();
  saveState();
  render();
}

function addBranch() {
  const source = selectedNode() || state.nodes[state.nodes.length - 1];
  addAction("condition");
  const condition = selectedNode();
  if (!condition || !source) return;
  condition.labelEs = "Evaluar condicion";
  condition.backendName = "evaluate_condition";
  condition.summary = "Divide el flujo segun criterio definido.";
  condition.criteria = "If [field] equals [value]";
  const yesId = nextNodeId();
  const noId = `N${Number(yesId.slice(1)) + 1}`;
  const yesNode = branchNode(yesId, condition.x - 250, condition.y + 155, "Rama SI", "branch_yes_action");
  const noNode = branchNode(noId, condition.x + 250, condition.y + 155, "Rama NO", "branch_no_action");
  state.nodes.push(yesNode, noNode);
  state.edges.push({ from: condition.id, to: yesId, label: "Si" }, { from: condition.id, to: noId, label: "No" });
  selectedNodeId = condition.id;
  markUnsaved();
  saveState();
  render();
}

function branchNode(id, x, y, labelEs, backendName) {
  return {
    id,
    type: "action",
    actionKey: "update_field",
    labelEs,
    backendName,
    summary: "Define action for this branch.",
    criteria: "Branch criteria inherited from condition.",
    fieldsUpdated: "TBD",
    ownerRule: "TBD",
    sla: "TBD",
    notification: "TBD",
    developerNotes: "Replace this placeholder with the correct branch action.",
    x,
    y,
  };
}

function deleteNode() {
  const node = selectedNode();
  if (!node || state.nodes.length <= 1) return;
  const confirmed = window.confirm(`Delete "${node.labelEs}" from this automation?`);
  if (!confirmed) return;
  state.nodes = state.nodes.filter((item) => item.id !== node.id);
  state.edges = state.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id);
  selectedNodeId = state.nodes[0]?.id || null;
  markUnsaved();
  saveState();
  render();
}

function restoreTemplate() {
  const confirmed = window.confirm("Restore the original CS Pipeline starter workflow? This replaces that saved starter template, but leaves other folder drafts alone.");
  if (!confirmed) return;
  const restored = clone(seedWorkflow);
  restored.saved = true;
  restored.status = "Saved";
  restored.savedAt = new Date().toISOString();
  appState.workflows = appState.workflows.filter((workflow) => workflow.id !== restored.id);
  appState.workflows.push(restored);
  appState.activeCategory = restored.category;
  appState.activeWorkflowId = restored.id;
  state = restored;
  selectedNodeId = state.nodes[0]?.id || null;
  saveState();
  render();
}

function newWorkflow() {
  const category = appState.activeCategory || automationFolders[0].category;
  const fresh = createBlankWorkflow(category);
  fresh.title = `Nueva automatizacion - ${category}`;
  fresh.nodes = [
    {
      id: "N1",
      type: "trigger",
      actionKey: "trigger",
      labelEs: "Nuevo disparador",
      backendName: "new_trigger",
      summary: "Define cuando debe iniciar esta automatizacion.",
      criteria: "Define trigger criteria.",
      fieldsUpdated: "N/A",
      ownerRule: "N/A",
      sla: "Immediate",
      notification: "N/A",
      developerNotes: "Replace this starter trigger with the real rule.",
      x: 520,
      y: 120,
    },
  ];
  state = fresh;
  appState.workflows.push(fresh);
  appState.activeWorkflowId = fresh.id;
  appState.activeCategory = fresh.category;
  selectedNodeId = "N1";
  saveState();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(state.title)}.automation.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importJsonFile(input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const importedWorkflows = extractImportedWorkflows(parsed);
    if (!importedWorkflows.length) {
      alert("No valid automation workflows were found in that JSON file.");
      return;
    }

    const timestamp = Date.now();
    const normalizedWorkflows = importedWorkflows.map((workflow, index) => normalizeImportedWorkflow(workflow, timestamp, index));
    appState.workflows.push(...normalizedWorkflows);

    const activeImport = normalizedWorkflows[0];
    appState.activeCategory = activeImport.category;
    appState.activeWorkflowId = activeImport.id;
    state = activeImport;
    selectedNodeId = activeImport.nodes[0]?.id || null;
    saveState();
    render();
    alert(`Imported ${normalizedWorkflows.length} automation${normalizedWorkflows.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error("Import failed", error);
    alert("That JSON file could not be imported. Please choose a valid exported automation JSON file.");
  }
}

function extractImportedWorkflows(parsed) {
  if (Array.isArray(parsed?.workflows)) return parsed.workflows.filter(isWorkflowLike);
  if (isWorkflowLike(parsed)) return [parsed];
  return [];
}

function isWorkflowLike(value) {
  return Boolean(value && typeof value === "object" && Array.isArray(value.nodes) && Array.isArray(value.edges));
}

function normalizeImportedWorkflow(workflow, timestamp, index) {
  const imported = clone(workflow);
  imported.id = makeUniqueWorkflowId(imported.id || "imported-workflow", timestamp, index);
  imported.folder = imported.folder || folderFromCategory(imported.category || appState.activeCategory);
  imported.category = imported.category || appState.activeCategory || automationFolders[0].category;
  imported.title = imported.title || `Imported automation ${index + 1}`;
  imported.owner = imported.owner || "Imported";
  imported.status = "Saved";
  imported.saved = true;
  imported.savedAt = new Date().toISOString();
  imported.updatedAt = imported.savedAt;
  imported.objective = imported.objective || "Imported automation workflow.";
  imported.nodes = imported.nodes.map((node, nodeIndex) => ({
    id: node.id || `N${nodeIndex + 1}`,
    type: node.type || actionTypes.find((action) => action.key === node.actionKey)?.nodeType || "action",
    actionKey: node.actionKey || "update_field",
    labelEs: node.labelEs || `Paso ${nodeIndex + 1}`,
    backendName: node.backendName || `imported_step_${nodeIndex + 1}`,
    summary: node.summary || "",
    criteria: node.criteria || "",
    fieldsUpdated: node.fieldsUpdated || "",
    ownerRule: node.ownerRule || "",
    sla: node.sla || "",
    notification: node.notification || "",
    developerNotes: node.developerNotes || "",
    ruleBuilder: node.ruleBuilder,
    x: Number.isFinite(node.x) ? node.x : 120 + nodeIndex * 40,
    y: Number.isFinite(node.y) ? node.y : 120 + nodeIndex * 130,
  }));
  imported.edges = imported.edges
    .filter((edge) => edge?.from && edge?.to)
    .map((edge) => ({ from: edge.from, to: edge.to, label: edge.label || "" }));
  return imported;
}

function makeUniqueWorkflowId(baseId, timestamp, index) {
  const safeBase = slugify(baseId) || "imported-workflow";
  let id = `${safeBase}-imported-${timestamp}${index ? `-${index + 1}` : ""}`;
  let suffix = 2;
  while (appState.workflows.some((workflow) => workflow.id === id)) {
    id = `${safeBase}-imported-${timestamp}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function folderFromCategory(category) {
  if (category?.includes("Pipeline") || category?.includes("Caso") || category?.includes("SLA")) return "Servicio al Cliente";
  return category || "Imported";
}

async function copySpec() {
  const spec = buildMarkdownSpec();
  try {
    await navigator.clipboard.writeText(spec);
    alert("Developer spec copied to clipboard.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = spec;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    alert("Developer spec copied to clipboard.");
  }
}

function buildMarkdownSpec() {
  const lines = [
    `# ${state.title}`,
    "",
    `Folder: ${state.folder}`,
    `Category: ${state.category}`,
    `Status: ${state.status}`,
    "",
    `Objective: ${state.objective}`,
    "",
    "## Pipeline",
    pipelineStages.map((stage) => `- ${stage}`).join("\n"),
    "",
    "## Steps",
  ];
  state.nodes.forEach((node) => {
    lines.push(
      "",
      `### ${node.id}. ${node.labelEs}`,
      `Backend name: ${node.backendName}`,
      `Action type: ${typeLabel(node)}`,
      `Summary: ${node.summary}`,
      `Criteria: ${node.criteria}`,
      `Fields updated: ${node.fieldsUpdated}`,
      `Owner rule: ${node.ownerRule}`,
      `Delay/SLA: ${node.sla}`,
      `Notification: ${node.notification}`,
      `Developer notes: ${node.developerNotes}`,
    );
  });
  lines.push("", "## Edges");
  state.edges.forEach((edge) => {
    lines.push(`- ${edge.from} -> ${edge.to}${edge.label ? ` (${edge.label})` : ""}`);
  });
  return lines.join("\n");
}

function setZoom(value) {
  zoom = Math.min(1.35, Math.max(0.55, Number(value.toFixed(2))));
  render();
}

function updatePrintOnly() {
  const printSheet = document.querySelector(".print-sheet");
  if (printSheet) printSheet.outerHTML = renderPrintSheet();
}

function refreshSelectedNodeCard(node) {
  const nodeEl = document.querySelector(`[data-node-id="${node.id}"]`);
  if (!nodeEl) return;
  const title = nodeEl.querySelector(".node-title");
  const backend = nodeEl.querySelector(".node-backend");
  const note = nodeEl.querySelector(".node-note");
  if (title) title.textContent = node.labelEs;
  if (backend) backend.textContent = node.backendName;
  if (note) note.textContent = node.summary;
}

function nextNodeId() {
  const max = state.nodes.reduce((highest, node) => {
    const number = Number(node.id.replace(/\D/g, ""));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);
  return `N${max + 1}`;
}

function typeLabel(node) {
  return actionTypes.find((action) => action.key === node.actionKey)?.label || node.type;
}

function spanishDefault(actionKey) {
  const defaults = {
    trigger: "Nuevo disparador",
    condition: "Evaluar condicion",
    assign_owner: "Asignar responsable",
    move_stage: "Mover etapa",
    create_task: "Crear tarea",
    notify: "Enviar notificacion",
    wait: "Esperar tiempo definido",
    update_field: "Actualizar campo",
    webhook: "Enviar webhook / API",
    close_ticket: "Cerrar ticket",
  };
  return defaults[actionKey] || "Nueva accion";
}

function backendDefault(actionKey) {
  const defaults = {
    trigger: "new_trigger",
    condition: "evaluate_condition",
    assign_owner: "assign_owner",
    move_stage: "move_pipeline_stage",
    create_task: "create_follow_up_task",
    notify: "send_notification",
    wait: "wait_delay",
    update_field: "update_ticket_field",
    webhook: "send_webhook",
    close_ticket: "close_ticket",
  };
  return defaults[actionKey] || "new_action";
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

render();
