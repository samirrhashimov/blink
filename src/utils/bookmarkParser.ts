
export interface ImportResult {
    title: string;
    url: string;
    folder?: string;
}

export const parseNetscapeBookmarks = (htmlContent: string): ImportResult[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const results: ImportResult[] = [];

    const traverse = (element: Element, currentFolder: string | undefined) => {
        const children = Array.from(element.children);

        for (const child of children) {
            if (child.tagName === 'DT') {
                const h3 = child.querySelector('h3');
                const a = child.querySelector('a');

                if (h3) {
                    // This is a folder
                    const folderName = h3.textContent || undefined;
                    // The DL sibling usually contains the items in this folder
                    // However, in standard Netscape format, the data structure is often <DT><H3>...</H3><DL>...</DL>
                    // So we check if there is a DL immediately following (or inside, depending on implementation)
                    // But actually in valid HTML, DL cannot be inside DT, but browsers fix it or it's just nested structure.
                    // In raw Netscape files, it's <DT><H3>Title</H3> \n <DL><p> ... items ... </DL>

                    // DOMParser standardizes this. Let's look for the next Sibling DL if it's not a child
                    let nextDl = child.querySelector('dl');
                    if (!nextDl) {
                        let nextSibling = child.nextElementSibling;
                        while (nextSibling && nextSibling.tagName !== 'DL') {
                            nextSibling = nextSibling.nextElementSibling;
                        }
                        if (nextSibling && nextSibling.tagName === 'DL') {
                            nextDl = nextSibling as HTMLDListElement;
                        }
                    }

                    if (nextDl) {
                        traverse(nextDl, folderName);
                    }
                } else if (a) {
                    // This is a bookmark
                    results.push({
                        title: a.textContent || 'Untitled',
                        url: a.getAttribute('href') || '',
                        folder: currentFolder
                    });
                }
            } else if (child.tagName === 'DL') {
                traverse(child, currentFolder);
            }
        }
    };

    // Start from the body or the first DL
    const dl = doc.querySelector('dl');
    if (dl) {
        traverse(dl, undefined);
    } else {
        // Fallback: try to find any link if structure is weird
        const links = doc.querySelectorAll('a');
        links.forEach(a => {
            results.push({
                title: a.textContent || 'Untitled',
                url: a.getAttribute('href') || '',
                folder: undefined
            });
        })
    }

    return results;
};
