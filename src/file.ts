import { Md, Options } from "../type";
import path from "path";
import { writeFile, mkdir, access } from "fs/promises";

export async function generateFile(mdArr: Md[], config: Options) {
	for (let i = 0; i < mdArr.length; i++) {
		const md = mdArr[i];
		if (Array.isArray(md)) {
			await generateFile(md, config);
		} else {
			const categories = md.categories;
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
			let content = config.template;
			content = content.replace(
				"{- html -}",
				md.parseContent ? JSON.parse(md.parseContent) : ""
			);

			// toc
			if (
				config.toc === true ||
				(Array.isArray(config.toc) && config.toc.includes(md.title))
			) {
				if (md.toc) content = md.toc + "<br />" + content;
			}

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
