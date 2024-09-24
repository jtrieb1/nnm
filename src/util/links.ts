function handle_to_link(name: string): string {
    // If handle starts with '@', it goes to IG
    if (name[0] !== '@') {
        // Otherwise, it's a link already
        return name;
    }
    // Remove '@' symbol
    name = name.substring(1);
    return `https://instagram.com/${name}`;
}

export default handle_to_link;