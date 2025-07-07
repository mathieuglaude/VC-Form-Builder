import { relations } from "drizzle-orm/relations";
import { formConfigs, formSubmissions } from "./schema";

export const formSubmissionsRelations = relations(formSubmissions, ({one}) => ({
	formConfig: one(formConfigs, {
		fields: [formSubmissions.formConfigId],
		references: [formConfigs.id]
	}),
}));

export const formConfigsRelations = relations(formConfigs, ({many}) => ({
	formSubmissions: many(formSubmissions),
}));