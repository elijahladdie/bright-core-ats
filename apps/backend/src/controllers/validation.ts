type ValidationIssue = { path: PropertyKey[]; message: string };

export function validationFields(error: { issues: ValidationIssue[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    fields[String(issue.path[0] ?? "form")] = issue.message;
  }
  return fields;
}
