import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/**
 * 从医院名称跳转到官网详情页面
 * @param {string} name - 医院名称
 */
export function openHospitalPage(name) {
	const tempForm = document.createElement('form');
	tempForm.id = 'tempForm1';
	tempForm.method = 'post';
	tempForm.action = 'https://fw.ybj.beijing.gov.cn/ddyy/ddyy/list';
	tempForm.target = 'ddyy1form';

	const hideInput = document.createElement('input');
	hideInput.type = 'hidden';
	hideInput.name = 'search_LIKE_yymc';
	hideInput.value = name;

	tempForm.appendChild(hideInput);

	tempForm.addEventListener('submit', () => {
		window.open('https://fw.ybj.beijing.gov.cn/ddyy/ddyy/list', 'ddyy1form');
	});

	document.body.appendChild(tempForm);
	tempForm.submit();
	document.body.removeChild(tempForm);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
