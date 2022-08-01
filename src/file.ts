import path from "path";
import { writeFile, mkdir, access } from "fs/promises";
import { presetTemplate } from "./presetList";

/** 将Mds按照原目录结构生成目标文件*/
export async function generateFile(mdArr: Md[], config: Options) {
	for (let i = 0; i < mdArr.length; i++) {
		const md = mdArr[i];
		if (Array.isArray(md)) {
			await generateFile(md, config);
		} else {
			const categories = md.categories_en || md.categories;
			// 创建目录
			let dirPath = path.resolve(config.outDir);
			for (let i = 0; i < categories.length; i++) {
				const category = categories[i];
				dirPath = path.join(dirPath, category);
				try {
					await access(dirPath);
				} catch {
					await mkdir(dirPath);
				}
			}
			const parseContent = md.parseContent;

			const content =
				typeof config.template === "function"
					? config.template(parseContent || "", { type: config.type })
					: presetTemplate(parseContent || "", { type: config.type });
			await writeFile(
				path.join(dirPath, `${md.title_en || md.title}.${config.type}`),
				content,
				{
					encoding: "utf-8",
					flag: "w+",
				}
			);
		}
	}
	return mdArr;
}
