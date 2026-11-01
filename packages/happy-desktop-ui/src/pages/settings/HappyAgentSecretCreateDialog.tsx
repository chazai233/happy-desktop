import { translate } from "../../localization/translate";
import { Banner } from "../../Banner";
import { Box } from "../../Box";
import { Button } from "../../Button";
import { FormRow } from "../../FormRow";
import { Modal } from "../../Modal";
import { ModalOverlay } from "../../ModalOverlay";
import { Switch } from "../../Switch";
import { TextField } from "../../TextField";

export interface HappyAgentSecretVariableDraft {
    readonly id: number;
    readonly name: string;
    readonly value: string;
}

export interface HappyAgentSecretCreateDraft {
    readonly availableToAgents: boolean;
    readonly description: string;
    readonly nextVariableId: number;
    readonly variables: readonly HappyAgentSecretVariableDraft[];
}

export interface HappyAgentSecretCreateDialogProps {
    readonly attempted: boolean;
    readonly draft: HappyAgentSecretCreateDraft;
    readonly error?: string;
    readonly submitting: boolean;
    readonly unavailable?: string;
    onAvailableToAgentsChange(value: boolean): void;
    onClose(): void;
    onDescriptionChange(value: string): void;
    onSubmit(): void;
    onVariableAdd(): void;
    onVariableNameChange(id: number, value: string): void;
    onVariableRemove(id: number): void;
    onVariableValueChange(id: number, value: string): void;
}

const ENVIRONMENT_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const DESCRIPTION_MAX_LENGTH = 2_000;
const ENVIRONMENT_NAME_MAX_LENGTH = 256;
const ENVIRONMENT_VALUE_MAX_LENGTH = 65_536;
export const HAPPY_AGENT_SECRET_ENVIRONMENT_MAX_VARIABLES = 256;

/** True when the complete draft satisfies the daemon's public create contract. */
export function happyAgentSecretCreateDraftValid(draft: HappyAgentSecretCreateDraft): boolean {
    return (
        descriptionError(draft.description) === undefined &&
        draft.variables.length > 0 &&
        draft.variables.length <= HAPPY_AGENT_SECRET_ENVIRONMENT_MAX_VARIABLES &&
        draft.variables.every(
            (variable) =>
                variableNameError(variable.name, draft.variables) === undefined &&
                variableValueError(variable.value) === undefined,
        )
    );
}

/** The write-only create form hosted on the standard Settings modal layer. */
export function HappyAgentSecretCreateDialog(props: HappyAgentSecretCreateDialogProps) {
    const disabled = props.submitting || props.unavailable !== undefined;
    return (
        <ModalOverlay
            onDismiss={() => {
                if (!props.submitting) props.onClose();
            }}
        >
            <Modal
                footer={
                    <>
                        <Button disabled={props.submitting} onClick={props.onClose} variant="ghost">
                            {translate("Cancel")}
                        </Button>
                        <Button
                            disabled={props.unavailable !== undefined}
                            loading={props.submitting}
                            onClick={props.onSubmit}
                        >
                            {translate("Create secret")}
                        </Button>
                    </>
                }
                icon="lock"
                onClose={props.submitting ? undefined : props.onClose}
                size="medium"
                title={translate("Create secret")}
            >
                <Box
                    className="happy-agent-secret-create"
                    data-happy-desktop-ui="happy-agent-secret-create"
                >
                    <Banner icon="lock" tone="neutral" title={translate("Values stay hidden")}>
                        {translate(
                            "Secret values are sent once and are never returned by Happy Agent or shown in this list.",
                        )}
                    </Banner>
                    {props.unavailable ? (
                        <Banner tone="neutral" title={translate("Happy Agent unavailable")}>
                            {props.unavailable}
                        </Banner>
                    ) : null}
                    {props.error ? (
                        <Banner tone="danger" title={translate("Secret not created")}>
                            {props.error}
                        </Banner>
                    ) : null}
                    <TextField
                        autoFocus
                        disabled={disabled}
                        error={
                            props.attempted ? descriptionError(props.draft.description) : undefined
                        }
                        fullWidth
                        label={translate("Description")}
                        onSubmit={props.onSubmit}
                        onValueChange={props.onDescriptionChange}
                        placeholder={translate("Production deploy credentials")}
                        value={props.draft.description}
                    />
                    <fieldset className="happy-agent-secret-create__environment">
                        <legend>{translate("Environment variables")}</legend>
                        <p>
                            {translate(
                                "Add the variable names agents receive and the write-only values to store under them.",
                            )}
                        </p>
                        <Box className="happy-agent-secret-create__variables">
                            {props.draft.variables.map((variable) => (
                                <Box
                                    className="happy-agent-secret-create__variable"
                                    data-happy-desktop-ui="happy-agent-secret-create-variable"
                                    key={variable.id}
                                >
                                    <TextField
                                        autoComplete="off"
                                        disabled={disabled}
                                        error={
                                            props.attempted
                                                ? variableNameError(
                                                      variable.name,
                                                      props.draft.variables,
                                                  )
                                                : undefined
                                        }
                                        fullWidth
                                        label={translate("Variable name")}
                                        onSubmit={props.onSubmit}
                                        onValueChange={(value) =>
                                            props.onVariableNameChange(variable.id, value)
                                        }
                                        placeholder="API_TOKEN"
                                        value={variable.name}
                                    />
                                    <TextField
                                        autoComplete="new-password"
                                        disabled={disabled}
                                        error={
                                            props.attempted
                                                ? variableValueError(variable.value)
                                                : undefined
                                        }
                                        fullWidth
                                        label={translate("Secret value")}
                                        onSubmit={props.onSubmit}
                                        onValueChange={(value) =>
                                            props.onVariableValueChange(variable.id, value)
                                        }
                                        placeholder={translate("Enter value")}
                                        type="password"
                                        value={variable.value}
                                    />
                                    <Box className="happy-agent-secret-create__remove">
                                        <Button
                                            aria-label={translate(
                                                "Remove {0}",
                                                variable.name || "environment variable",
                                            )}
                                            disabled={
                                                disabled || props.draft.variables.length === 1
                                            }
                                            icon="trash"
                                            iconOnly
                                            onClick={() => props.onVariableRemove(variable.id)}
                                            size="medium"
                                            variant="ghost"
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Button
                            disabled={
                                disabled ||
                                props.draft.variables.length >=
                                    HAPPY_AGENT_SECRET_ENVIRONMENT_MAX_VARIABLES
                            }
                            icon="plus"
                            onClick={props.onVariableAdd}
                            size="small"
                            variant="ghost"
                        >
                            {translate("Add variable")}
                        </Button>
                    </fieldset>
                    <FormRow
                        control={
                            <Switch
                                aria-label={translate("Available to every agent")}
                                checked={props.draft.availableToAgents}
                                disabled={disabled}
                                id="happy-agent-secret-create-available"
                                onChange={props.onAvailableToAgentsChange}
                            />
                        }
                        description={translate(
                            "When off, the secret stays stored until scoped access is granted to a project, workspace, or agent.",
                        )}
                        htmlFor="happy-agent-secret-create-available"
                        label={translate("Available to every agent")}
                    />
                </Box>
            </Modal>
        </ModalOverlay>
    );
}

function descriptionError(description: string): string | undefined {
    if (description.trim().length === 0) return translate("Enter a description.");
    if (description.length > DESCRIPTION_MAX_LENGTH)
        return translate("Use {0} characters or fewer.", String(DESCRIPTION_MAX_LENGTH));
    return undefined;
}

function variableNameError(
    name: string,
    variables: readonly HappyAgentSecretVariableDraft[],
): string | undefined {
    if (name.length === 0) return translate("Enter a variable name.");
    if (name.length > ENVIRONMENT_NAME_MAX_LENGTH)
        return translate("Use {0} characters or fewer.", String(ENVIRONMENT_NAME_MAX_LENGTH));
    if (!ENVIRONMENT_NAME.test(name))
        return translate(
            "Use letters, numbers, and underscores, starting with a letter or underscore.",
        );
    if (variables.filter((variable) => variable.name === name).length > 1)
        return translate("Each variable name must be unique.");
    return undefined;
}

function variableValueError(value: string): string | undefined {
    if (value.includes("\0")) return translate("Secret values cannot contain a null character.");
    if (value.length > ENVIRONMENT_VALUE_MAX_LENGTH)
        return translate("Use {0} characters or fewer.", String(ENVIRONMENT_VALUE_MAX_LENGTH));
    return undefined;
}
