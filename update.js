const fs = require('fs');
const path = require('path');
const dir = 'src/manager/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  if (content.includes('<TouchableOpacity style={styles.tabItem}>') && content.includes('<Feather name="package"')) {
    // We only want to replace the exact block. Let's use a simpler string replace.
    // We can find the index of `<Feather name="package"` and backtrack to find `<TouchableOpacity style={styles.tabItem}>`
    
    // Actually regex is fine in a file
    const regex = /<TouchableOpacity style=\{styles\.tabItem\}>\s*<Feather name="package"/g;
    if (regex.test(content)) {
      content = content.replace(
        regex, 
        '<TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.(\'manager_assets\')}>\n          <Feather name="package"'
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
}
