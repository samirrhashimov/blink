
import type { Container } from '../types';

export const generateNetscapeBookmarks = (containers: Container[]): string => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    containers.forEach(container => {
        html += `    <DT><H3 ADD_DATE="${Math.floor(new Date(container.createdAt).getTime() / 1000)}">${container.name}</H3>\n`;
        html += `    <DL><p>\n`;

        if (container.links && container.links.length > 0) {
            container.links.forEach(link => {
                html += `        <DT><A HREF="${link.url}" ADD_DATE="${Math.floor(new Date(link.createdAt).getTime() / 1000)}">${link.title}</A>\n`;
            });
        }

        html += `    </DL><p>\n`;
    });

    html += `</DL><p>\n`;
    return html;
};

export const downloadBookmarks = (containers: Container[], filename = 'blink_bookmarks.html') => {
    const htmlContent = generateNetscapeBookmarks(containers);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
