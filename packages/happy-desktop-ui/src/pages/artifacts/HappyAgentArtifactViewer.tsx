import { translate } from "../../localization/translate";
import { useState, type CSSProperties, type ReactNode } from "react";
import {
    happyAgentArtifactBackground,
    happyAgentArtifactReferenceResolve,
    happyAgentArtifactTypeLabel,
    type HappyAgentArtifact,
    type HappyAgentArtifactContent,
    type HappyAgentArtifactDeletion,
    type HappyAgentArtifactFileLink,
    type HappyAgentArtifactVersion,
    type HappyAgentArtifactViewerSnapshot,
} from "happy-desktop-state";
import { Badge } from "../../Badge";
import { Banner } from "../../Banner";
import { Box } from "../../Box";
import { Button } from "../../Button";
import { EmptyState } from "../../EmptyState";
import { HtmlPreviewFrame } from "../../HtmlPreviewFrame";
import type { HtmlPreviewRenderer } from "../../htmlPreview";
import { ImageViewer } from "../../ImageViewer";
import { MarkdownDocument, type MarkdownDocumentReferences } from "../../MarkdownDocument";
import { Modal } from "../../Modal";
import { ModalOverlay } from "../../ModalOverlay";
import { ScrollArea } from "../../Scrollbar";
import { VideoViewer } from "../../VideoViewer";
import { Ionicon } from "../../vectorIcons/VectorIcon";
import {
    ArtifactTypeGlyph,
    artifactFileName,
    artifactMadeBy,
    artifactSizeText,
    type HappyAgentArtifactLabels,
} from "./artifactPresentation";
import { ArtifactHeader } from "./ArtifactHeader";
import { HappyAgentArtifactHtmlFrame } from "./HappyAgentArtifactHtmlFrame";
import type { MessageReferences } from "../../messageReferences";

export interface HappyAgentArtifactViewerProps {
    /** The open artifact, its history, and the version on screen, as the viewer store holds them. */
    viewer: HappyAgentArtifactViewerSnapshot;
    labels: HappyAgentArtifactLabels;
    onVersionSelect: (number: number) => void;
    /** Reads the next page of older versions. */
    onVersionsLoadMore: () => void;
    onDeletionRequest: () => void;
    onDeletionCancel: () => void;
    onDeletionConfirm: () => void;
    /**
     * Saves one file of the version on screen. A link in the artifact to another
     * of its files lands here too: the file is the artifact's, and there is no
     * page here to navigate to.
     */
    onFileDownload: (link: HappyAgentArtifactFileLink) => void;
    /**
     * Leaves the viewer for wherever it was opened from. Absent where there is
     * nowhere to go back to, such as a tab, which its own close button ends.
     */
    onBack?: () => void;
    /**
     * Whether the versions column starts out shown. It starts hidden: the
     * artifact comes first, and the History button brings the column up.
     */
    defaultHistoryShown?: boolean;
    /**
     * Drawn as a tab's content — beside a chat in the side panel, or as a tab
     * of the main content — under a strip that is already the window's header
     * row, so the viewer's own header is a slim toolbar.
     */
    tab?: boolean;
    /**
     * Keeps the artifact among the reader's Surfaces, or takes it out. Absent
     * where the Happy Agent has no Surfaces.
     */
    surface?: { readonly added: boolean; readonly onToggle: () => void };
    /**
     * The host's isolated guest for an HTML version served as a site. Absent
     * where the host has none, in which case the viewer never holds a site.
     */
    renderPage?: HtmlPreviewRenderer;
    /**
     * Reads and opens the `happy://` links to Happy entities a Markdown
     * version carries, as a message's do. Absent, each reads as its label.
     */
    entities?: MessageReferences;
    className?: string;
    "data-testid"?: string;
    style?: CSSProperties;
}

/**
 * HappyAgentArtifactViewer — one artifact: what it is, where it was made and by
 * whom, every version of it, and the version on screen shown the way its type
 * reads best.
 *
 * Every file it shows comes from one numbered version, so a page and the
 * pictures it names can never come from two different versions. The history
 * beside it picks which version that is; picking the newest follows the newest
 * again as the artifact changes. Deleting asks first, and names the version it
 * is deleting so a change made meanwhile is not deleted unseen.
 */
export function HappyAgentArtifactViewer(props: HappyAgentArtifactViewerProps) {
    const viewer = props.viewer;
    const [historyShown, setHistoryShown] = useState(props.defaultHistoryShown ?? false);
    const state = viewer.artifact;
    const artifact = state.type === "ready" ? state.value : undefined;
    // Checked again where it becomes a style: a snapshot can be built by hand.
    const background = happyAgentArtifactBackground(viewer.version?.background);
    const back = props.onBack ? (
        <Button
            aria-label={translate("Back")}
            iconOnly
            onClick={props.onBack}
            size="small"
            title={translate("Back")}
            variant="ghost"
        >
            <Ionicon name="arrow-back" size={14} />
        </Button>
    ) : undefined;
    return (
        <div
            className={["happy-agent-artifact-viewer", props.className].filter(Boolean).join(" ")}
            data-happy-desktop-ui="happy-agent-artifact-viewer"
            data-testid={props["data-testid"]}
            style={props.style}
        >
            {artifact ? (
                <>
                    <ArtifactHeader
                        className="happy-agent-artifact-viewer__header"
                        {...(props.tab ? { compact: true } : {})}
                        {...(back ? { leading: back } : {})}
                        subtitle={happyAgentArtifactTypeLabel(artifact.type)}
                        title={artifact.title || translate("Untitled")}
                        trailing={
                            <>
                                {artifact.status === "active" ? (
                                    <Button
                                        aria-pressed={historyShown}
                                        icon="history"
                                        onClick={() => setHistoryShown(!historyShown)}
                                        size="small"
                                        variant="ghost"
                                    >
                                        {translate("History")}
                                    </Button>
                                ) : null}
                                {artifact.status === "active" && props.surface ? (
                                    <Button
                                        aria-pressed={props.surface.added}
                                        data-testid="happy-agent-artifact-surface"
                                        icon={props.surface.added ? "check" : "plus"}
                                        onClick={props.surface.onToggle}
                                        size="small"
                                        title={
                                            props.surface.added
                                                ? translate("Remove from sidebar")
                                                : undefined
                                        }
                                        variant="ghost"
                                    >
                                        {props.surface.added
                                            ? translate("In sidebar")
                                            : translate("Add to sidebar")}
                                    </Button>
                                ) : null}
                                {artifact.status === "active" ? (
                                    <Button
                                        data-testid="happy-agent-artifact-delete"
                                        disabled={viewer.deletion.phase !== "idle"}
                                        icon="trash"
                                        onClick={props.onDeletionRequest}
                                        size="small"
                                        variant="ghost"
                                    >
                                        {translate("Delete")}
                                    </Button>
                                ) : null}
                            </>
                        }
                    />
                    {viewer.versionSelected !== undefined && artifact.status === "active" ? (
                        <ArtifactOlder
                            labels={props.labels}
                            onLatestShow={() => props.onVersionSelect(artifact.latestVersion)}
                            {...(viewer.version ? { version: viewer.version } : {})}
                            versionSelected={viewer.versionSelected}
                        />
                    ) : null}
                    <div
                        className="happy-agent-artifact-viewer__main"
                        data-happy-desktop-ui="happy-agent-artifact-viewer-main"
                    >
                        {/* The slot the version is shown in. It paints nothing of
                            its own, so the surface shows through, unless the
                            version names a colour to be shown on. */}
                        <div
                            className="happy-agent-artifact-viewer__body"
                            data-happy-desktop-ui="happy-agent-artifact-viewer-body"
                            style={
                                background && artifact.status === "active"
                                    ? { backgroundColor: background }
                                    : undefined
                            }
                        >
                            {artifact.status === "deleted" ? (
                                <EmptyState
                                    description={deletedSentence(artifact, props.labels)}
                                    icon="trash"
                                    size="panel"
                                    title={translate("This artifact was deleted")}
                                />
                            ) : (
                                <ArtifactContent
                                    content={viewer.content}
                                    {...(props.entities ? { entities: props.entities } : {})}
                                    files={viewer.files}
                                    key={viewer.version?.number ?? 0}
                                    onFileDownload={props.onFileDownload}
                                    {...(props.renderPage ? { renderPage: props.renderPage } : {})}
                                    title={artifact.title}
                                />
                            )}
                        </div>
                        {artifact.status === "active" && historyShown ? (
                            <ArtifactHistory
                                artifact={artifact}
                                labels={props.labels}
                                onFileDownload={props.onFileDownload}
                                onVersionSelect={props.onVersionSelect}
                                onVersionsLoadMore={props.onVersionsLoadMore}
                                viewer={viewer}
                            />
                        ) : null}
                    </div>
                    {viewer.deletion.phase === "idle" ? null : (
                        <ArtifactDeleteDialog
                            deletion={viewer.deletion}
                            onCancel={props.onDeletionCancel}
                            onConfirm={props.onDeletionConfirm}
                            title={artifact.title}
                        />
                    )}
                </>
            ) : (
                <>
                    <ArtifactHeader
                        className="happy-agent-artifact-viewer__header"
                        {...(props.tab ? { compact: true } : {})}
                        {...(back ? { leading: back } : {})}
                        title={translate("Artifact")}
                    />
                    {state.type === "missing" ? (
                        <EmptyState
                            description={translate(
                                "Nothing with this name is published on this Happy Agent.",
                            )}
                            icon="package"
                            size="panel"
                            title={translate("Artifact not found")}
                        />
                    ) : state.type === "error" ? (
                        <EmptyState
                            description={state.error.message}
                            icon="alert"
                            size="panel"
                            title={translate("The artifact could not be read")}
                        />
                    ) : (
                        <EmptyState
                            description={translate("Reading the artifact and its history.")}
                            icon="clock"
                            size="panel"
                            title={translate("Loading artifact…")}
                        />
                    )}
                </>
            )}
        </div>
    );
}

function deletedSentence(artifact: HappyAgentArtifact, labels: HappyAgentArtifactLabels): string {
    const by = artifact.deletedBy ? labels.author(artifact.deletedBy) : "Someone";
    const where = labels.source(artifact.deletedSource);
    const when = artifact.deletedAt === null ? "" : ` on ${labels.time(artifact.deletedAt)}`;
    return translate(
        "Deleted by {0}{1}. Its versions are no longer served.",
        artifactMadeBy(by, where),
        when,
    );
}

/**
 * Said only when the reader is looking back at an older version, with the way
 * back to the newest, since everything below then describes a version that is
 * no longer current.
 */
function ArtifactOlder(props: {
    labels: HappyAgentArtifactLabels;
    version?: HappyAgentArtifactVersion;
    versionSelected: number;
    onLatestShow: () => void;
}) {
    const labels = props.labels;
    const shown = props.versionSelected;
    return (
        <div
            className="happy-agent-artifact-viewer__older"
            data-happy-desktop-ui="happy-agent-artifact-viewer-older"
        >
            <Banner
                action={{ label: translate("Show latest"), onClick: props.onLatestShow }}
                tone="info"
                title={translate("Showing version {0}", String(shown))}
            >
                {props.version && props.version.number === shown
                    ? translate(
                          "Made by {0} · {1}.",
                          artifactMadeBy(
                              labels.author(props.version.createdBy),
                              labels.source(props.version.source),
                          ),
                          labels.time(props.version.createdAt),
                      )
                    : translate("An older version of this artifact.")}
            </Banner>
        </div>
    );
}

/** The version on screen, shown the way its type reads best. */
function ArtifactContent(props: {
    content: HappyAgentArtifactContent;
    entities?: MessageReferences;
    files: readonly HappyAgentArtifactFileLink[];
    onFileDownload: (link: HappyAgentArtifactFileLink) => void;
    renderPage?: HtmlPreviewRenderer;
    title: string;
}): ReactNode {
    const content = props.content;
    switch (content.type) {
        case "loading":
            return (
                <EmptyState
                    description={translate("Reading this version's files.")}
                    icon="clock"
                    size="panel"
                    title={translate("Loading…")}
                />
            );
        case "error":
            return (
                <div className="happy-agent-artifact-viewer__fallback">
                    <Banner tone="danger" title={translate("This version could not be shown")}>
                        {content.error.message}
                    </Banner>
                    <ArtifactFileList files={props.files} onFileDownload={props.onFileDownload} />
                </div>
            );
        case "markdown": {
            const fileOf = (path: string) => props.files.find((link) => link.file.path === path);
            const references: MarkdownDocumentReferences = {
                image: (src) => {
                    const target = happyAgentArtifactReferenceResolve(content.entryPath, src);
                    return target.type === "file" ? content.files.get(target.path) : undefined;
                },
                link: (href) => {
                    const target = happyAgentArtifactReferenceResolve(content.entryPath, href);
                    return target.type === "file" && content.files.has(target.path)
                        ? target.path
                        : undefined;
                },
            };
            return (
                <MarkdownDocument
                    className="happy-agent-artifact-viewer__markdown"
                    {...(props.entities ? { entities: props.entities } : {})}
                    onFileOpen={(path) => {
                        const link = fileOf(path);
                        if (link) props.onFileDownload(link);
                    }}
                    references={references}
                    text={content.text}
                />
            );
        }
        case "html":
            return content.page.kind === "site" ? (
                <HtmlPreviewFrame
                    canvas="none"
                    data-testid="happy-agent-artifact-page"
                    {...(props.renderPage ? { renderContent: props.renderPage } : {})}
                    source={content.page.url}
                />
            ) : (
                <HappyAgentArtifactHtmlFrame
                    assets={content.page.assets}
                    entryPath={content.entryPath}
                    omitted={content.page.omitted}
                    reason={content.page.reason}
                    text={content.page.text}
                    title={props.title || translate("Web page")}
                />
            );
        case "image":
            return (
                <ImageViewer
                    content={{ type: "url", url: content.image.url }}
                    name={artifactFileName(content.image.file.path)}
                    tone="immersive"
                />
            );
        case "image_series":
            return <ArtifactGallery images={content.images} />;
        case "video":
            return (
                <VideoViewer
                    content={{ type: "url", url: content.video.url }}
                    name={artifactFileName(content.video.file.path)}
                    tone="immersive"
                />
            );
        case "document":
            return content.inlineUrl !== undefined ? (
                <iframe
                    className="happy-agent-artifact-viewer__document"
                    data-happy-desktop-ui="happy-agent-artifact-document"
                    src={content.inlineUrl}
                    title={artifactFileName(content.document.file.path)}
                />
            ) : (
                <div className="happy-agent-artifact-viewer__fallback">
                    <ArtifactFileCard
                        link={content.document}
                        onFileDownload={props.onFileDownload}
                    />
                </div>
            );
        case "files":
            return (
                <div className="happy-agent-artifact-viewer__fallback">
                    <Banner tone="neutral" title={translate("Shown as its files")}>
                        {translate(
                            "This kind of artifact has no viewer here yet. Its files can still be downloaded.",
                        )}
                    </Banner>
                    <ArtifactFileList files={props.files} onFileDownload={props.onFileDownload} />
                </div>
            );
    }
}

/**
 * The pictures of an image series in the order they were listed, one large
 * with the whole run below it. Which one is large is this surface's own
 * business, and a new version starts again from the first.
 */
function ArtifactGallery(props: { images: readonly HappyAgentArtifactFileLink[] }) {
    const [selected, setSelected] = useState(0);
    const index = Math.min(selected, props.images.length - 1);
    const shown = props.images[index];
    if (!shown)
        return (
            <EmptyState
                icon="image"
                size="panel"
                title={translate("This series has no pictures")}
            />
        );
    return (
        <div
            className="happy-agent-artifact-gallery"
            data-happy-desktop-ui="happy-agent-artifact-gallery"
        >
            <div className="happy-agent-artifact-gallery__stage">
                <ImageViewer
                    adjacentImages={{
                        previous:
                            props.images[(index - 1 + props.images.length) % props.images.length]
                                ?.url,
                        next: props.images[(index + 1) % props.images.length]?.url,
                    }}
                    content={{ type: "url", url: shown.url }}
                    name={artifactFileName(shown.file.path)}
                    tone="immersive"
                />
            </div>
            <ScrollArea
                axes="horizontal"
                className="happy-agent-artifact-gallery__strip"
                data-happy-desktop-ui="happy-agent-artifact-gallery-strip"
                viewportClassName="happy-agent-artifact-gallery__strip-viewport"
            >
                <div
                    aria-label={translate("Pictures in this series")}
                    className="happy-agent-artifact-gallery__thumbs"
                    role="group"
                >
                    {props.images.map((image, index) => (
                        <button
                            aria-label={artifactFileName(image.file.path)}
                            aria-pressed={image === shown}
                            className="happy-agent-artifact-gallery__thumb"
                            data-happy-desktop-ui="happy-agent-artifact-gallery-thumb"
                            key={image.file.path}
                            onClick={() => setSelected(index)}
                            title={translate(
                                "{0} of {1} · {2}",
                                String(index + 1),
                                String(props.images.length),
                                artifactFileName(image.file.path),
                            )}
                            type="button"
                        >
                            <img
                                alt=""
                                className="happy-agent-artifact-gallery__thumb-image"
                                draggable={false}
                                loading="lazy"
                                src={image.url}
                            />
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

/** One file stated plainly — its name, its kind, its size — with the way to save it. */
function ArtifactFileCard(props: {
    link: HappyAgentArtifactFileLink;
    onFileDownload: (link: HappyAgentArtifactFileLink) => void;
}) {
    const file = props.link.file;
    return (
        <div
            className="happy-agent-artifact-viewer__file-card"
            data-happy-desktop-ui="happy-agent-artifact-file-card"
        >
            <span aria-hidden="true" className="happy-agent-artifact-viewer__file-card-glyph">
                <ArtifactTypeGlyph size={20} type="document" />
            </span>
            <span className="happy-agent-artifact-viewer__file-card-text">
                <span className="happy-agent-artifact-viewer__file-card-name">
                    {artifactFileName(file.path)}
                </span>
                <span className="happy-agent-artifact-viewer__file-card-meta">
                    {file.mimeType} · {artifactSizeText(file.size)}
                </span>
            </span>
            <Button onClick={() => props.onFileDownload(props.link)} size="small">
                {translate("Download")}
            </Button>
        </div>
    );
}

/** Every file of the version on screen, each one savable. */
function ArtifactFileList(props: {
    files: readonly HappyAgentArtifactFileLink[];
    onFileDownload: (link: HappyAgentArtifactFileLink) => void;
}) {
    return (
        <ul
            className="happy-agent-artifact-files"
            data-happy-desktop-ui="happy-agent-artifact-files"
        >
            {props.files.map((link) => (
                <li className="happy-agent-artifact-files__item" key={link.file.path}>
                    <span className="happy-agent-artifact-files__text">
                        <span className="happy-agent-artifact-files__name" title={link.file.path}>
                            {link.file.path}
                        </span>
                        <span className="happy-agent-artifact-files__meta">
                            {artifactSizeText(link.file.size)}
                        </span>
                    </span>
                    <Button
                        aria-label={translate("Download {0}", artifactFileName(link.file.path))}
                        iconOnly
                        onClick={() => props.onFileDownload(link)}
                        size="small"
                        title={translate("Download")}
                        variant="ghost"
                    >
                        <Ionicon name="download-outline" size={14} />
                    </Button>
                </li>
            ))}
        </ul>
    );
}

/**
 * The column beside the artifact: every version, newest first, each with who
 * made it, where, and when; then the files of the version on screen.
 */
function ArtifactHistory(props: {
    artifact: HappyAgentArtifact;
    viewer: HappyAgentArtifactViewerSnapshot;
    labels: HappyAgentArtifactLabels;
    onVersionSelect: (number: number) => void;
    onVersionsLoadMore: () => void;
    onFileDownload: (link: HappyAgentArtifactFileLink) => void;
}) {
    const viewer = props.viewer;
    const shown = viewer.versionSelected ?? props.artifact.latestVersion;
    return (
        <aside
            aria-label={translate("Versions and files")}
            className="happy-agent-artifact-history"
            data-happy-desktop-ui="happy-agent-artifact-history"
        >
            <ScrollArea
                className="happy-agent-artifact-history__scroll"
                viewportClassName="happy-agent-artifact-history__scroll-viewport"
            >
                <div className="happy-agent-artifact-history__content">
                    <h2 className="happy-agent-artifact-history__heading">
                        {translate("Versions")}
                    </h2>
                    {viewer.versions.length === 0 ? (
                        <p className="happy-agent-artifact-history__note">
                            {viewer.versionsLoading
                                ? translate("Reading the history…")
                                : translate("No history to show.")}
                        </p>
                    ) : (
                        <ol
                            className="happy-agent-artifact-history__versions"
                            data-happy-desktop-ui="happy-agent-artifact-versions"
                        >
                            {viewer.versions.map((version) => (
                                <li key={version.number}>
                                    <button
                                        aria-current={version.number === shown ? "true" : undefined}
                                        className="happy-agent-artifact-history__version"
                                        data-happy-desktop-ui="happy-agent-artifact-version"
                                        data-version={version.number}
                                        onClick={() => props.onVersionSelect(version.number)}
                                        type="button"
                                    >
                                        <span className="happy-agent-artifact-history__version-line">
                                            <span className="happy-agent-artifact-history__version-number">
                                                {translate("Version")} {version.number}
                                            </span>
                                            {version.number === props.artifact.latestVersion ? (
                                                <Badge
                                                    label={translate("Latest")}
                                                    variant="outline"
                                                />
                                            ) : null}
                                        </span>
                                        <span className="happy-agent-artifact-history__version-meta">
                                            {artifactMadeBy(
                                                props.labels.author(version.createdBy),
                                                props.labels.source(version.source),
                                            )}
                                        </span>
                                        <span className="happy-agent-artifact-history__version-meta">
                                            {props.labels.time(version.createdAt)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    )}
                    {viewer.versionsHasMore ? (
                        <Button
                            loading={viewer.versionsLoading}
                            onClick={props.onVersionsLoadMore}
                            size="small"
                            variant="ghost"
                        >
                            {translate("Show older versions")}
                        </Button>
                    ) : null}
                    {viewer.files.length > 0 ? (
                        <>
                            <h2 className="happy-agent-artifact-history__heading">
                                {translate("Files in version")} {shown}
                            </h2>
                            <ArtifactFileList
                                files={viewer.files}
                                onFileDownload={props.onFileDownload}
                            />
                        </>
                    ) : null}
                </div>
            </ScrollArea>
        </aside>
    );
}

/**
 * The confirmation before an artifact is deleted for everyone. It stays up
 * while the deletion is under way, and says so inside itself when the daemon
 * refuses — most often because the artifact changed while it was open.
 */
function ArtifactDeleteDialog(props: {
    deletion: Exclude<HappyAgentArtifactDeletion, { readonly phase: "idle" }>;
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const pending = props.deletion.phase === "pending";
    const title = props.title || "Untitled";
    return (
        <ModalOverlay onDismiss={pending ? undefined : props.onCancel}>
            <Modal
                className="happy-agent-artifact-delete-dialog"
                footer={
                    <Box className="happy-agent-artifact-delete-dialog__actions">
                        <Button disabled={pending} onClick={props.onCancel} variant="ghost">
                            {translate("Cancel")}
                        </Button>
                        <Button
                            data-testid="happy-agent-artifact-delete-confirm"
                            loading={pending}
                            onClick={props.onConfirm}
                            variant="danger"
                        >
                            {pending ? translate("Deleting…") : translate("Delete artifact")}
                        </Button>
                    </Box>
                }
                icon="trash"
                onClose={pending ? undefined : props.onCancel}
                size="small"
                title={translate("Delete “{0}”?", title)}
                tone="danger"
            >
                <Box className="happy-agent-artifact-delete-dialog__body">
                    {props.deletion.phase === "failed" ? (
                        <Banner tone="danger" title={translate("Not deleted")}>
                            {props.deletion.error.message}
                        </Banner>
                    ) : null}
                    <span className="happy-agent-artifact-delete-dialog__message">
                        {translate("This deletes")} {title}
                        {translate(
                            "for everyone. Its versions stop being served, and it stays listed only as deleted.",
                        )}
                    </span>
                </Box>
            </Modal>
        </ModalOverlay>
    );
}
